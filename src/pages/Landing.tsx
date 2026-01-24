import { Link } from 'react-router-dom';
import { Home, Users, DollarSign, ClipboardList, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: DollarSign,
    title: 'Expense Tracking',
    description: 'Split bills fairly and track who owes what. Never argue about money again.',
  },
  {
    icon: ClipboardList,
    title: 'Chore Management',
    description: 'Automated rotating schedules ensure everyone does their fair share.',
  },
  {
    icon: MessageSquare,
    title: 'Communication Hub',
    description: 'Shared announcements and shopping lists keep everyone in the loop.',
  },
  {
    icon: Users,
    title: 'House Dashboard',
    description: 'See everything at a glance - pending tasks, balances, and activity.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">HouseShare</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Shared Living, <span className="text-primary">Simplified</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            HouseShare eliminates roommate conflicts with smart expense splitting, 
            automated chore schedules, and seamless communication tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                I have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need for harmonious living</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            From splitting the electricity bill to tracking whose turn it is to clean the bathroom, 
            HouseShare handles it all.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify your shared living?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of happy roommates who've eliminated household conflicts with HouseShare.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-success hover:bg-success/90">
              Create Your House Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">HouseShare</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} HouseShare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
