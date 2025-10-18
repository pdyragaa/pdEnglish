import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { Skeleton, SkeletonCard } from './ui/Skeleton';
import { Progress } from './ui/Progress';
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
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-4">
          <Skeleton width="300px" height="40px" />
          <Skeleton width="600px" height="24px" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        
        <div className="space-y-4">
          <Skeleton width="200px" height="32px" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Welcome Section */}
      <motion.div 
        className="relative text-center space-y-6 py-12 px-6 rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-3xl" />
        <div className="relative">
          <motion.div 
            className="flex items-center justify-center space-x-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Welcome to pdEnglish
            </h1>
          </motion.div>
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Master English vocabulary with Polish translations. Learn, practice, and track your progress with our intelligent spaced repetition system.
          </motion.p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {[
          {
            title: 'Total Words',
            value: stats.totalWords,
            description: 'Words in your vocabulary',
            icon: BookOpen,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            progress: Math.min((stats.totalWords / 1000) * 100, 100)
          },
          {
            title: 'Words Today',
            value: stats.wordsToday,
            description: 'Added today',
            icon: Clock,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            progress: Math.min((stats.wordsToday / 20) * 100, 100)
          },
          {
            title: 'Categories',
            value: stats.totalCategories,
            description: 'Word categories',
            icon: FolderOpen,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
            progress: Math.min((stats.totalCategories / 10) * 100, 100)
          },
          {
            title: 'Practice Streak',
            value: stats.practiceStreak,
            description: 'Days in a row',
            icon: TrendingUp,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            progress: Math.min((stats.practiceStreak / 30) * 100, 100)
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
            >
            <Card 
              className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 hover:-translate-y-1"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <motion.div 
                  className="text-3xl font-bold text-foreground"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <Progress 
                  value={stat.progress} 
                  size="sm" 
                  variant={index === 0 ? 'default' : index === 1 ? 'success' : index === 2 ? 'warning' : 'error'}
                  className="opacity-60"
                />
              </CardContent>
            </Card>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          >
            <Target className="w-8 h-8 text-primary" />
          </motion.div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
            >
              <Link to={action.href}>
                <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-primary/30 hover:-translate-y-2 overflow-hidden">
                  <CardContent className="p-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex flex-col items-center text-center space-y-4">
                      <motion.div 
                        className={`w-20 h-20 ${action.color} ${action.hoverColor} rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <action.icon className="w-10 h-10 text-white" />
                      </motion.div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                          {action.description}
                        </p>
                      </div>
                      <motion.div
                        className="flex items-center space-x-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm font-medium">Explore</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Words */}
      {recentWords.length > 0 && (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Recent Words
            </h2>
            <Link to="/vocabulary">
              <Button variant="outline" size="sm" className="group">
                View All
                <motion.div
                  className="ml-2"
                  whileHover={{ x: 3 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Button>
            </Link>
          </motion.div>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="space-y-1">
                {recentWords.map((word, idx) => (
                  <motion.div 
                    key={word.id} 
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 + idx * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <span className="text-sm font-bold text-primary">{idx + 1}</span>
                      </motion.div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {word.polish}
                        </div>
                        <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {word.english}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      {new Date(word.created_at).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Call to Action */}
      {stats.totalWords === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
              <div className="relative space-y-6">
                <motion.div 
                  className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto shadow-lg"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <Plus className="w-12 h-12 text-primary" />
                </motion.div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold text-foreground">Start Your Learning Journey</h3>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    Begin mastering English vocabulary with Polish translations. Your first word is just a click away!
                  </p>
                </div>
                <Link to="/translator">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="px-8 py-4 text-lg font-semibold shadow-lg">
                      <Languages className="w-6 h-6 mr-3" />
                      Start Translating
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
