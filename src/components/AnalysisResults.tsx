import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { CheckCircle, AlertCircle, TrendingUp, Users } from 'lucide-react';

interface AnalysisResultsProps {
  overallScore: number;
  sectionScores: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  missingSkills: string[];
  matchedSkills: string[];
  recommendations: string[];
  isLoading?: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  overallScore,
  sectionScores,
  missingSkills,
  matchedSkills,
  recommendations,
  isLoading = false
}) => {
  const sectionData = [
    { name: 'Skills', score: sectionScores.skills, color: '#8884d8' },
    { name: 'Experience', score: sectionScores.experience, color: '#82ca9d' },
    { name: 'Education', score: sectionScores.education, color: '#ffc658' },
    { name: 'Keywords', score: sectionScores.keywords, color: '#ff7300' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Match Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Match Percentage</span>
                <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}%
                </span>
              </div>
              <Progress value={overallScore} className="h-3" />
            </div>
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full ${getScoreBg(overallScore)} flex items-center justify-center text-white font-bold text-lg`}>
                {overallScore}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Section-wise Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Matched Skills ({matchedSkills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill, index) => (
                  <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Missing Skills ({missingSkills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill, index) => (
                  <Badge key={index} variant="destructive">
                    {skill}
                  </Badge>
                ))}
              </div>
              {missingSkills.length === 0 && (
                <p className="text-muted-foreground">No critical skills missing!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <p className="text-muted-foreground">No specific recommendations at this time.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};