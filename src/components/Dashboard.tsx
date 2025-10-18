import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Languages, 
  BookOpen, 
  Brain, 
  FolderOpen, 
  Plus, 
  TrendingUp, 
  Clock, 
  Target,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { db } from '../lib/supabase';

interface Stats {
  totalWords: number;
  totalCategories: number;
  wordsToday: number;
  practiceStreak: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalWords: 0,
    totalCategories: 0,
    wordsToday: 0,
    practiceStreak: 0
  });
  const [recentWords, setRecentWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [vocabulary, categories] = await Promise.all([
        db.vocabulary.getAll(),
        db.categories.getAll()
      ]);

      // Calculate today's words
      const today = new Date().toDateString();
      const wordsToday = vocabulary.filter(word => 
        new Date(word.created_at).toDateString() === today
      ).length;

      setStats({
        totalWords: vocabulary.length,
        totalCategories: categories.length,
        wordsToday,
        practiceStreak: 0 // TODO: Implement streak tracking
      });

      // Get recent words
      setRecentWords(vocabulary.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Translate & Learn',
      description: 'Translate Polish words to English',
      icon: Languages,
      href: '/translator',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'Practice Words',
      description: 'Review with spaced repetition',
      icon: Brain,
      href: '/practice',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'View Vocabulary',
      description: 'Browse all saved words',
      icon: BookOpen,
      href: '/vocabulary',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'Manage Categories',
      description: 'Organize your words',
      icon: FolderOpen,
      href: '/categories',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Welcome to pdEnglish</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master English vocabulary with Polish translations. Learn, practice, and track your progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Words
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalWords}</div>
            <p className="text-xs text-muted-foreground">
              Words in your vocabulary
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Words Today
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.wordsToday}</div>
            <p className="text-xs text-muted-foreground">
              Added today
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Word categories
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Practice Streak
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.practiceStreak}</div>
            <p className="text-xs text-muted-foreground">
              Days in a row
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
          <Target className="w-6 h-6 text-primary" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={action.title} to={action.href}>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-16 h-16 ${action.color} ${action.hoverColor} rounded-2xl flex items-center justify-center transition-colors duration-200 group-hover:scale-110`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Words */}
      {recentWords.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Recent Words</h2>
            <Link to="/vocabulary">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentWords.map((word, index) => (
                  <div key={word.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{word.polish}</div>
                        <div className="text-sm text-muted-foreground">{word.english}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(word.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Call to Action */}
      {stats.totalWords === 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Start Learning Today</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Begin your English learning journey by translating your first Polish word.
              </p>
              <Link to="/translator">
                <Button size="lg" className="mt-4">
                  <Languages className="w-5 h-5 mr-2" />
                  Start Translating
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
