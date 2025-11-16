'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Target, BarChart3, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CourseSettings {
  coTarget: number;
  internalWeightage: number;
  externalWeightage: number;
  level1Threshold: number;
  level2Threshold: number;
  level3Threshold: number;
}

interface OverviewTabProps {
  courseId: string;
  courseData?: any;
}

export function OverviewTab({ courseId, courseData }: OverviewTabProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CourseSettings>({
    coTarget: 60,
    internalWeightage: 40,
    externalWeightage: 60,
    level1Threshold: 60,
    level2Threshold: 70,
    level3Threshold: 80,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isProgramCoordinator = user?.role === 'PROGRAM_COORDINATOR';

  useEffect(() => {
    fetchCourseSettings();
  }, [courseId]);

  const fetchCourseSettings = async () => {
    try {
      // [MOCK DATA] Mock data for now
      const mockSettings: CourseSettings = {
        coTarget: 60,
        internalWeightage: 40,
        externalWeightage: 60,
        level1Threshold: 60,
        level2Threshold: 70,
        level3Threshold: 80,
      };
      setSettings(mockSettings);
    } catch (error) {
      console.error('Failed to fetch course settings:', error);
    }
  };

  const handleSave = async () => {
    if (!isProgramCoordinator) {
      toast({
        title: "Permission Denied",
        description: "Only Program Coordinators can edit course settings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // [MOCK API] Save settings to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: "Success",
        description: "Course settings updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    fetchCourseSettings();
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <Card className="p-3">
        <CardHeader className="px-0 pt-0 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <CardTitle className="text-sm">Course Settings</CardTitle>
            </div>
            {!isProgramCoordinator && (
              <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                Read-only (PC only)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 space-y-3">
          {/* CO Target */}
          <div className="space-y-1">
            <Label htmlFor="co-target" className="flex items-center gap-2 text-xs">
              <Target className="h-3 w-3" />
              CO Target Percentage
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="co-target"
                type="number"
                min="0"
                max="100"
                value={settings.coTarget}
                onChange={(e) => setSettings(prev => ({ ...prev, coTarget: parseInt(e.target.value) || 0 }))}
                disabled={!isEditing || !isProgramCoordinator}
                className="w-20 h-7"
              />
            </div>
          </div>

          {/* Assessment Weightage */}
          <div className="space-y-1">
            <Label className="flex items-center gap-2 text-xs">
              <BarChart3 className="h-3 w-3" />
              Assessment Weightage
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="internal-weightage" className="text-xs">Internal Assessment</Label>
                <div className="flex items-center gap-1">
                  <Input
                    id="internal-weightage"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.internalWeightage}
                    onChange={(e) => setSettings(prev => ({ ...prev, internalWeightage: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing || !isProgramCoordinator}
                    className="w-16 h-7"
                  />
                  <span className="text-xs">%</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="external-weightage" className="text-xs">External Assessment</Label>
                <div className="flex items-center gap-1">
                  <Input
                    id="external-weightage"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.externalWeightage}
                    onChange={(e) => setSettings(prev => ({ ...prev, externalWeightage: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing || !isProgramCoordinator}
                    className="w-16 h-7"
                  />
                  <span className="text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attainment Level Thresholds */}
          <div className="space-y-1">
            <Label className="flex items-center gap-2 text-xs">
              <BarChart3 className="h-3 w-3" />
              Attainment Level Thresholds
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="level1-threshold" className="text-xs">Level 1</Label>
                <div className="flex items-center gap-1">
                  <Input
                    id="level1-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.level1Threshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, level1Threshold: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing || !isProgramCoordinator}
                    className="w-16 h-7"
                  />
                  <span className="text-xs">%</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="level2-threshold" className="text-xs">Level 2</Label>
                <div className="flex items-center gap-1">
                  <Input
                    id="level2-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.level2Threshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, level2Threshold: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing || !isProgramCoordinator}
                    className="w-16 h-7"
                  />
                  <span className="text-xs">%</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="level3-threshold" className="text-xs">Level 3</Label>
                <div className="flex items-center gap-1">
                  <Input
                    id="level3-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.level3Threshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, level3Threshold: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing || !isProgramCoordinator}
                    className="w-16 h-7"
                  />
                  <span className="text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isProgramCoordinator && (
            <div className="flex gap-2 pt-2 border-t">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="h-7 px-2 text-xs">
                  Edit Settings
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} disabled={loading} className="h-7 px-2 text-xs">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="h-7 px-2 text-xs">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <div className="flex items-start gap-2">
              <Info className="h-3 w-3 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium">Course Settings</p>
                <p className="text-blue-700">
                  Configure CO targets and assessment weightage for outcome calculations.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}