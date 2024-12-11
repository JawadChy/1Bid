"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
      <Navbar />
      <motion.div 
        className="container mx-auto pt-24 px-4"
        animate={false}
      >
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Super User Dashboard
        </h1>
        
        <Tabs defaultValue="complaints" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="complaints">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Complaints</h2>
              {/* Complaints content will go here */}
              <p className="text-gray-500 dark:text-gray-400">No complaints to display.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="applications">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Applications</h2>
              {/* Applications content will go here */}
              <p className="text-gray-500 dark:text-gray-400">No applications to display.</p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
} 