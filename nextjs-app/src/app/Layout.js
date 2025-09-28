import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Heart, 
  ChefHat, 
  Sparkles, 
  BookOpen, 
  User,
  Home,
  PlusCircle,
  ShoppingCart,
  DollarSign,
  UserPlus,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Account",
    url: createPageUrl("Account"),
    icon: UserPlus,
  },
  {
    title: "Profile Setup",
    url: createPageUrl("ProfileSetup"),
    icon: Settings,
  },
  {
    title: "Grocery List",
    url: createPageUrl("GroceryList"),
    icon: ShoppingCart,
  },
  {
    title: "Budget Deals",
    url: createPageUrl("BudgetDeals"),
    icon: DollarSign,
  },
  {
    title: "Recipes from Grocery",
    url: createPageUrl("RecipesFromGrocery"),
    icon: ChefHat,
  },
  {
    title: "Recipe Builder",
    url: createPageUrl("RecipeBuilder"),
    icon: PlusCircle,
  },
  {
    title: "AI Recommendations",
    url: createPageUrl("AIRecommendations"),
    icon: Sparkles,
  },
  {
    title: "My Recipes",
    url: createPageUrl("MyRecipes"),
    icon: BookOpen,
  },
  {
    title: "Health Profile",
    url: createPageUrl("HealthProfile"),
    icon: User,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: 34 197 94;
          --primary-foreground: 255 255 255;
          --secondary: 240 253 244;
          --secondary-foreground: 22 101 52;
          --accent: 187 247 208;
          --accent-foreground: 21 128 61;
          --background: 255 255 255;
          --foreground: 15 23 42;
          --muted: 248 250 252;
          --muted-foreground: 100 116 139;
          --border: 226 232 240;
          --card: 255 255 255;
          --card-foreground: 15 23 42;
        }
        
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
        }
      `}</style>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-green-100 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-green-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">NutriCare</h2>
                <p className="text-xs text-green-600 font-medium">Healthy Recipe Builder</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-xl group ${
                          location.pathname === item.url ? 'bg-green-50 text-green-700 shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <ChefHat className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Saved Recipes</span>
                    <span className="ml-auto font-bold text-green-700">0</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">AI Suggestions</span>
                    <span className="ml-auto font-bold text-blue-700">Ready</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-green-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-semibold text-sm">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">Health User</p>
                <p className="text-xs text-gray-500 truncate">Manage your nutrition</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-gradient-to-br from-gray-50/50 to-green-50/30">
          <header className="bg-white/70 backdrop-blur-sm border-b border-green-100 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-green-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-gray-900">NutriCare</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}