import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, MessageCircle, Users, Video } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const faqs = [
  { q: 'How do I add a device to the canvas?', a: 'Tap the Tools button at the bottom of the Canvas screen to open the Device Library. Then tap any device to add it to the center of the canvas, or drag to place it at a specific position.' },
  { q: 'How do I connect two devices?', a: 'Open the Device Library and tap "Connection Tool". Then tap the first device (source), followed by the second device (target). A Bezier connection line will be drawn automatically.' },
  { q: 'Can I edit device properties?', a: 'Yes! Tap a device on the canvas to select it, then long-press to open the context menu and choose "Edit". This opens the Node Detail Sheet where you can configure hostname, IP address, interfaces, and more.' },
  { q: 'How does Auto Save work?', a: 'When Auto Save is enabled in Settings, your project is automatically saved to the cloud every 30 seconds whenever changes are detected. A yellow dot appears in the toolbar when there are unsaved changes.' },
  { q: 'What commands does the Terminal support?', a: 'The terminal supports: ping <ip>, traceroute <ip>, show ip route, show interfaces, and clear. More commands will be added in future updates.' },
  { q: 'How do I zoom and pan the canvas?', a: 'Use a two-finger pinch gesture to zoom in/out, and a single-finger drag to pan across the canvas. You can also use the zoom controls in the bottom toolbar.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View className="bg-card border border-border rounded-2xl overflow-hidden" style={{ borderCurve: 'continuous' }}>
      <Pressable onPress={() => setOpen((v) => !v)} className="flex-row items-center justify-between px-4 py-4 active:opacity-80">
        <Text className="text-foreground font-medium text-sm flex-1 pr-3">{q}</Text>
        {open ? <ChevronUp size={18} color="#6B7280" /> : <ChevronDown size={18} color="#6B7280" />}
      </Pressable>
      {open && (
        <View className="px-4 pb-4 pt-0">
          <View className="h-px bg-border mb-3" />
          <Text className="text-muted-foreground text-sm leading-5">{a}</Text>
        </View>
      )}
    </View>
  );
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="flex-row items-center gap-3 px-4 pb-4 border-b border-border bg-background" style={{ paddingTop: insets.top + 8 }}>
        <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full bg-card border border-border items-center justify-center active:opacity-70">
          <ArrowLeft size={18} color="#6B7280" />
        </Pressable>
        <Text className="text-foreground text-xl font-bold">Help & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
        <View className="px-5 py-5 gap-5">
          {/* Quick Links */}
          <View className="gap-2">
            <Text className="text-foreground font-semibold text-base">Quick Links</Text>
            <View className="flex-row gap-3">
              {[
                { icon: <BookOpen size={20} color="#3B82F6" />, label: 'Docs', bg: 'bg-primary/10' },
                { icon: <Video size={20} color="#8B5CF6" />, label: 'Tutorials', bg: 'bg-[#8B5CF6]/10' },
                { icon: <Users size={20} color="#22C55E" />, label: 'Community', bg: 'bg-[#22C55E]/10' },
                { icon: <MessageCircle size={20} color="#F59E0B" />, label: 'Support', bg: 'bg-[#F59E0B]/10' },
              ].map((item) => (
                <Pressable key={item.label} onPress={() => {}} className="flex-1 items-center gap-2 py-4 bg-card border border-border rounded-2xl active:opacity-70" style={{ borderCurve: 'continuous' }}>
                  <View className={`w-10 h-10 rounded-full ${item.bg} items-center justify-center`}>{item.icon}</View>
                  <Text className="text-muted-foreground text-xs text-center">{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Getting Started */}
          <View className="gap-3">
            <Text className="text-foreground font-semibold text-base">Getting Started</Text>
            <View className="bg-card border border-border rounded-2xl p-4 gap-3" style={{ borderCurve: 'continuous' }}>
              {[
                { step: '1', text: 'Create a new project from the Dashboard or Projects tab.' },
                { step: '2', text: 'Use the Device Library to add routers, switches, and end devices.' },
                { step: '3', text: 'Connect devices using the Connection Tool.' },
                { step: '4', text: 'Configure device properties by tapping on them.' },
                { step: '5', text: 'Open the Terminal to run network commands.' },
              ].map((item) => (
                <View key={item.step} className="flex-row items-start gap-3">
                  <View className="w-6 h-6 rounded-full bg-primary items-center justify-center mt-0.5">
                    <Text className="text-white text-xs font-bold">{item.step}</Text>
                  </View>
                  <Text className="text-foreground text-sm flex-1 leading-5">{item.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* FAQ */}
          <View className="gap-3">
            <Text className="text-foreground font-semibold text-base">Frequently Asked Questions</Text>
            {faqs.map((faq, i) => <FaqItem key={i} {...faq} />)}
          </View>

          {/* Contact */}
          <Pressable onPress={() => {}} className="bg-primary/10 border border-primary/30 rounded-2xl p-4 items-center active:opacity-70" style={{ borderCurve: 'continuous' }}>
            <MessageCircle size={24} color="#3B82F6" />
            <Text className="text-primary font-semibold mt-2">Contact Support</Text>
            <Text className="text-muted-foreground text-xs mt-1">support@packetflow.app</Text>
          </Pressable>

          <View className="h-6" />
        </View>
      </ScrollView>
    </View>
  );
}
