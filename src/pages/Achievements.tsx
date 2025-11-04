
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Award, 
  ChevronLeft, 
  Trophy, 
  Star, 
  Flag, 
  Bookmark, 
  Heart 
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  getAllAchievements, 
  getUserAchievements, 
  getAchievementStats 
} from "@/services/achievementService";
import { Achievement, UserAchievement, AchievementStats } from "@/types/achievement";
import { useToast } from "@/hooks/use-toast";

const categoryIcons: Record<string, React.ReactNode> = {
  STREAK: <Flag className="w-5 h-5" />,
  COUNT: <Star className="w-5 h-5" />,
  MILESTONE: <Trophy className="w-5 h-5" />,
  SPECIAL: <Bookmark className="w-5 h-5" />
};

const categoryColors: Record<string, string> = {
  STREAK: "bg-blue-500/10 text-blue-500",
  COUNT: "bg-amber-500/10 text-amber-500",
  MILESTONE: "bg-purple-500/10 text-purple-500",
  SPECIAL: "bg-green-500/10 text-green-500"
};

const AchievementsPage = () => {
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get a temporary userId until auth is fully implemented
  const userId = localStorage.getItem('userId') || '12345';

  useEffect(() => {
    const fetchAchievementData = async () => {
      setLoading(true);
      try {
        const [achievements, userAchievs, achievementStats] = await Promise.all([
          getAllAchievements(),
          getUserAchievements(userId),
          getAchievementStats(userId)
        ]);
        
        setAllAchievements(achievements);
        setUserAchievements(userAchievs);
        setStats(achievementStats);
      } catch (error) {
        console.error("Error fetching achievement data:", error);
        toast({
          title: "Error loading achievements",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAchievementData();
  }, [userId, toast]);

  // Get unique categories from achievements
  const categories = Array.from(new Set(allAchievements.map(a => a.category)));

  // Filter achievements by selected category
  const filteredAchievements = selectedCategory
    ? allAchievements.filter(a => a.category === selectedCategory)
    : allAchievements;

  // Map achievements with user progress
  const achievementsWithProgress = filteredAchievements.map(achievement => {
    const userAchievement = userAchievements.find(
      ua => (ua.achievementId as any)._id === achievement.id
    );
    
    return {
      ...achievement,
      userProgress: userAchievement?.progress || { percent: 0 },
      isCompleted: !!userAchievement?.dateUnlocked,
      completedAt: userAchievement?.dateUnlocked,
      completionCount: userAchievement?.completionCount || 0
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Top Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-1">
                <ChevronLeft className="w-5 h-5 text-foreground/70" />
                <span className="text-foreground/70">Back</span>
              </Link>
              <h1 className="text-xl font-semibold text-gradient">
                Achievements & Milestones
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Award className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse h-8 w-8 rounded-full bg-primary/50"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.completedAchievements}</div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.totalAchievements}</div>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.earnedPoints}</div>
                      <p className="text-sm text-muted-foreground">Points Earned</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <Progress value={(stats.earnedPoints / Math.max(stats.totalPoints, 1)) * 100} className="w-full" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Progress</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge 
                variant={selectedCategory === null ? "default" : "secondary"}
                className="cursor-pointer text-sm py-1 px-3"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              
              {categories.map(category => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? "default" : "secondary"}
                  className="cursor-pointer text-sm py-1 px-3"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </Badge>
              ))}
            </div>
            
            {/* Achievement List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievementsWithProgress.map(achievement => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02 }}
                  className={`content-card overflow-hidden ${
                    achievement.isCompleted 
                      ? "border-primary/50" 
                      : "border-muted"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${categoryColors[achievement.category] || "bg-muted text-foreground"}`}>
                        {categoryIcons[achievement.category] || <Star className="w-5 h-5" />}
                      </div>
                      <div className="text-2xl">{achievement.icon}</div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-1">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    
                    {achievement.isCompleted ? (
                      <div className="text-sm text-primary flex items-center space-x-1">
                        <Award className="w-4 h-4" />
                        <span>
                          Achieved {achievement.completedAt 
                            ? new Date(achievement.completedAt).toLocaleDateString() 
                            : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground flex justify-between">
                          <span>Progress</span>
                          <span>{Math.round(achievement.userProgress.percent || 0)}%</span>
                        </div>
                        <Progress value={achievement.userProgress.percent || 0} />
                      </div>
                    )}
                    
                    {achievement.isRepeatable && achievement.completionCount > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Completed {achievement.completionCount} {achievement.completionCount === 1 ? 'time' : 'times'}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Recent Unlocks */}
            {stats && stats.recentUnlocks.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-medium mb-4 text-gradient">Recently Unlocked</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.recentUnlocks.map((ua) => {
                    const achievement = ua.achievementId as any;
                    return (
                      <motion.div
                        key={ua.id}
                        whileHover={{ scale: 1.02 }}
                        className="content-card overflow-hidden border-primary/50"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${categoryColors[achievement.category] || "bg-muted text-foreground"}`}>
                              {categoryIcons[achievement.category] || <Star className="w-5 h-5" />}
                            </div>
                            <div className="text-2xl">{achievement.icon}</div>
                          </div>
                          
                          <h3 className="text-lg font-medium mb-1">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                          
                          <div className="text-sm text-primary flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>
                              Achieved {ua.dateUnlocked 
                                ? new Date(ua.dateUnlocked).toLocaleDateString() 
                                : ''}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AchievementsPage;
