import React from 'react';

import {SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarSeparator} from '@/components/ui/sidebar';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card';
import {Icons} from '@/components/icons';
import {Button} from '@/components/ui/button';
import {AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction} from '@/components/ui/alert-dialog';
import {toast} from '@/hooks/use-toast';

export default function Home() {
  const handleAlert = () => {
    toast({
      title: 'Alert triggered!',
      description: 'The predicted price reached the specified threshold.',
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <h2 className="font-semibold text-lg">LTC Price Prophet</h2>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>General</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.trendingUp className="mr-2 h-4 w-4" />
                      <span>Price Prediction</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.alertTriangle className="mr-2 h-4 w-4" />
                      <span>Price Alerts</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Technical Analysis</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.search className="mr-2 h-4 w-4" />
                      <span>Indicators</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button variant="ghost" className="justify-start">
                      <Icons.info className="mr-2 h-4 w-4" />
                      <span>Analysis View</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Predicted Price</CardTitle>
                <CardDescription>Bi-LSTM Model Prediction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">$78.50</div>
                <div className="text-sm text-muted-foreground">Next 24 hours</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>Social Media Sentiment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">Positive</div>
                <div className="text-sm text-muted-foreground">Reddit, Twitter</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Indicators</CardTitle>
                <CardDescription>Key Indicators Overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">RSI: 65</div>
                <div className="text-sm text-muted-foreground">Neutral</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Chart</CardTitle>
                <CardDescription>LTC Price and Indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <img src="https://picsum.photos/800/400" alt="Interactive Chart" className="rounded-md" />
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Set Price Alert</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Set Price Alert</AlertDialogTitle>
                  <AlertDialogDescription>
                    Receive notifications when the predicted price reaches a specified threshold.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAlert}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
