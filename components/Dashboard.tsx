'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';
import { Layout } from './Layout';
import { Analytics } from './Analytics';
import { ActivityHistory } from './ActivityHistory';
import { ActivityForm } from './ActivityForm';
import { SessionManager } from './SessionManager';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Upload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewType = 'dashboard' | 'log-activity' | 'analytics' | 'history' | 'import-export' | 'settings';

interface DashboardProps {
  activities: Activity[];
  sessionId: string;
  sessionCode: string;
  onAddActivity: (
    name: string,
    duration: number
  ) => void;
  onDeleteActivity: (id: string) => void;
}

export function Dashboard({
  activities,
  sessionId,
  sessionCode,
  onAddActivity,
  onDeleteActivity,
}: DashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);

  const handleQuickAdd = () => {
    setShowActivityForm(true);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(activities, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `focusloop-activities-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedActivities = JSON.parse(e.target?.result as string);
            // Here you would typically validate and merge the imported data
            console.log('Imported activities:', importedActivities);
          } catch (error) {
            console.error('Error importing activities:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      
      
      case 'analytics':
        return <Analytics activities={activities} />;
      
      case 'history':
        return <ActivityHistory activities={activities} onDeleteActivity={onDeleteActivity} />;
      
      case 'import-export':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Import & Export</h2>
              <p className="text-white/60">Manage your activity data</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Export Data</h3>
                      <p className="text-white/60">Download your activities</p>
                    </div>
                  </div>
                  <p className="text-white/60 mb-6">
                    Export all your activity data as a JSON file for backup or analysis.
                  </p>
                  <Button
                    onClick={handleExportData}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Activities
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Import Data</h3>
                      <p className="text-white/60">Restore from backup</p>
                    </div>
                  </div>
                  <p className="text-white/60 mb-6">
                    Import previously exported activity data from a JSON file.
                  </p>
                  <Button
                    onClick={handleImportData}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Activities
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-white/10 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Data Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-white/60 text-sm">Total Activities</p>
                    <p className="text-2xl font-bold text-white">{activities.length}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Duration</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.floor(activities.reduce((acc, a) => acc + a.duration, 0) / 60)}h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
              <p className="text-white/60">Manage your preferences and account</p>
            </div>
            
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Session Information</h3>
                    <p className="text-white/60">Your current session details</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="text-white/60 text-sm">Session Code</p>
                      <p className="text-white font-mono">{sessionCode}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowSessionManager(true)}
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      Manage
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="text-white/60 text-sm">Session ID</p>
                      <p className="text-white font-mono text-sm">{sessionId}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <>
      <Layout
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view as ViewType)}
        sessionCode={sessionCode}
        activities={activities}
        onQuickAdd={handleQuickAdd}
      >
        {renderCurrentView()}
      </Layout>

      {/* Quick Add Activity Modal */}
      <ActivityForm
        isOpen={showActivityForm}
        onClose={() => setShowActivityForm(false)}
        onSubmit={onAddActivity}
      />

      {/* Session Manager Dialog */}
      <SessionManager
        sessionCode={sessionCode}
        isOpen={showSessionManager}
        onOpenChange={setShowSessionManager}
      />
    </>
  );
}
