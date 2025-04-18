'use client';

import React from 'react';

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card';
import {Icons} from '@/components/icons';
import {Button} from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {toast} from '@/hooks/use-toast';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

export default function Home() {
  const handleAlert = () => {
    toast({
      title: 'Alert triggered!',
      description: 'The predicted price reached the specified threshold.',
    });
  };

  const data = [
    {name: 'Jan', price: 74.0},
    {name: 'Feb', price: 74.5},
    {name: 'Mar', price: 73.2},
    {name: 'Apr', price: 75.8},
    {name: 'May', price: 76.1},
    {name: 'Jun', price: 77.9},
    {name: 'Jul', price: 78.5},
  ];

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

        <main className="flex-1 p-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Predicted Price</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Bi-LSTM Model Prediction
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-semibold text-primary">$78.50</div>
                <div className="text-sm text-muted-foreground">Next 24 hours</div>
              </CardContent>
            </Card>

            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Sentiment Analysis</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Social Media Sentiment
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-semibold text-green-500">Positive</div>
                <div className="text-sm text-muted-foreground">Reddit, Twitter</div>
              </CardContent>
            </Card>

            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Technical Indicators</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Key Indicators Overview
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-xl font-semibold">RSI: 65</div>
                <div className="text-sm text-muted-foreground">Neutral</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Interactive Chart</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  LTC Price and Indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  Set Price Alert
                </Button>
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
