
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Phone, MapPin, Linkedin, Github, Twitter } from "lucide-react";
import SectionContainer from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ContactAnimation from "@/components/animations/ContactAnimation";
import { useContactForm } from "@/hooks/useContactForm";

export default function Contact() {
  const { submitContact, isSubmitting } = useContactForm();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await submitContact(formData);

    if (result.success) {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    }
  };

  const contactMethods = [
    {
      title: "Email",
      value: "imshivanshutiwari@gmail.com",
      icon: <Mail className="w-6 h-6 text-brand-blue" />,
    },
    {
      title: "Phone",
      value: "+91 8305014147",
      icon: <Phone className="w-6 h-6 text-brand-blue" />,
    },
    {
      title: "Location",
      value: "DIAT, Pune, Maharashtra, India",
      icon: <MapPin className="w-6 h-6 text-brand-blue" />,
    },
  ];

  const socialLinks = [
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/imshivanshutiwari",
      icon: <Linkedin className="w-6 h-6" />,
      color: "hover:bg-[#0077B5] hover:text-white",
    },
    {
      name: "GitHub",
      url: "https://github.com/imshivanshutiwari",
      icon: <Github className="w-6 h-6" />,
      color: "hover:bg-[#333] hover:text-white",
    },
    {
      name: "Twitter",
      url: "https://twitter.com/imshivanshutiwari",
      icon: <Twitter className="w-6 h-6" />,
      color: "hover:bg-[#1DA1F2] hover:text-white",
    },
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <>
      {/* Hero Section with Animation */}
      <div className="relative pt-24 pb-16 md:py-32 overflow-hidden">
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 1.5 } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-brand-blue/5" />
          <motion.div
            className="absolute top-40 right-40 w-96 h-96 rounded-full bg-brand-blue/5 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </motion.div>

        <motion.div
          className="container mx-auto px-6 md:px-8 relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div className="max-w-3xl" variants={staggerContainer}>
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-6"
              variants={fadeInUp}
            >
              Contact Me
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8"
              variants={fadeInUp}
            >
              Let's collaborate and innovate together
            </motion.p>
            <motion.p
              className="text-muted-foreground max-w-xl"
              variants={fadeInUp}
            >
              I'm open to research collaborations, consulting opportunities,
              speaking engagements, and innovative partnerships in AI and defense technology.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      <SectionContainer>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {/* Contact Form with Animation */}
          <motion.div
            className="lg:col-span-3"
            variants={fadeInUp}
          >
            <motion.h2
              className="section-heading"
              variants={fadeInUp}
            >
              Send Me a Message
            </motion.h2>
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6 mt-8"
              variants={staggerContainer}
            >
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={staggerContainer}
              >
                <motion.div
                  className="space-y-2"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="name" className="text-sm font-medium">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="transition-all duration-200 focus:border-brand-blue"
                  />
                </motion.div>
                <motion.div
                  className="space-y-2"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <label htmlFor="email" className="text-sm font-medium">
                    Your Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="transition-all duration-200 focus:border-brand-blue"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                className="space-y-2"
                variants={fadeInUp}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can I help you?"
                  required
                  className="transition-all duration-200 focus:border-brand-blue"
                />
              </motion.div>

              <motion.div
                className="space-y-2"
                variants={fadeInUp}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={6}
                  required
                  className="transition-all duration-200 focus:border-brand-blue resize-none"
                />
              </motion.div>

              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <RainbowButton type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={18} />
                      Send Message
                    </span>
                  )}
                </RainbowButton>
              </motion.div>
            </motion.form>
          </motion.div>

          {/* Contact Info with Animation */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            variants={staggerContainer}
          >
            <motion.div variants={staggerContainer}>
              <motion.h2
                className="section-heading"
                variants={fadeInUp}
              >
                Contact Information
              </motion.h2>
              <motion.div
                className="space-y-6 mt-8"
                variants={staggerContainer}
              >
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4"
                    variants={fadeInUp}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <motion.div
                      className="p-3 rounded-full bg-secondary flex-shrink-0"
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "var(--brand-blue-rgb, rgba(0, 85, 255, 0.1))",
                        transition: { duration: 0.2 }
                      }}
                    >
                      {method.icon}
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-medium">{method.title}</h3>
                      <p className="text-muted-foreground">{method.value}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h2 className="text-xl font-bold mb-6">Connect with Me</h2>
              <motion.div
                className="flex gap-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 border border-border rounded-full transition-all duration-300 ${link.color}`}
                    aria-label={link.name}
                    variants={{
                      hidden: { opacity: 0, scale: 0 },
                      visible: {
                        opacity: 1,
                        scale: 1,
                        transition: {
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 260,
                          damping: 20
                        }
                      }
                    }}
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="glass-card rounded-xl p-6"
              variants={fadeInUp}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 85, 255, 0.1)",
                transition: { duration: 0.2 }
              }}
            >
              <h3 className="text-xl font-bold mb-4">Available for</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Research Collaborations</li>
                <li>• Technical Consulting</li>
                <li>• Speaking Engagements</li>
                <li>• Defense Technology Innovation</li>
              </ul>
            </motion.div>

            {/* Lottie Animation */}
            <motion.div
              className="h-64 flex items-center justify-center"
              variants={fadeInUp}
            >
              <ContactAnimation />
            </motion.div>
          </motion.div>
        </motion.div>
      </SectionContainer>
    </>
  );
}
