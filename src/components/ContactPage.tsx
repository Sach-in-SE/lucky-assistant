
import React, { useState } from "react";
import { Github, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please enter your message",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Your message has been sent successfully!",
    });

    setFormData({ name: "", email: "", message: "" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="glass rounded-2xl modern-shadow">
      <div className="grid md:grid-cols-2 gap-8 p-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
              Developer
            </h2>
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-full bg-blue-500/10 dark:bg-blue-400/20">
                <Github className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Sachin Kumar
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Full Stack Developer
                </p>
                <a
                  href="https://www.instagram.com/official__luc_ky"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 mt-1"
                >
                  <Instagram className="h-3 w-3" />
                  @official__luc_ky
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href="mailto:lucky002954@gmail.com"
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors group"
            >
              <div className="p-3 rounded-full bg-blue-500/10 dark:bg-blue-400/20 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-400/30 transition-colors">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  Email
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  lucky002954@gmail.com
                </div>
              </div>
            </a>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div className="p-3 rounded-full bg-blue-500/10 dark:bg-blue-400/20">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  Phone
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  +91 9759938908
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div className="p-3 rounded-full bg-blue-500/10 dark:bg-blue-400/20">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  Address
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Bareilly, Uttar Pradesh
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Send us a Message
          </h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                Name
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
                className="gradient-border focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800/80 dark:border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your email"
                className="gradient-border focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800/80 dark:border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                Message
              </label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Your message"
                className="gradient-border focus:ring-2 focus:ring-blue-500/20 min-h-[150px] dark:bg-slate-800/80 dark:border-slate-700"
              />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white font-medium shadow-md hover:shadow-lg transition-all"
              type="submit"
            >
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
