export type AIProvider = {
  id: string;
  name: string;
  connected: boolean;
  iconName: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Viewer";
  isYou?: boolean;
  avatarBg?: string;
};

export type OnboardingData = {
  orgName: string;
  industry: string;
  companySize: string;
  country: string;
  connectedProviders: string[]; // ids of connected providers
  optimizationLevel: "Conservative" | "Balanced" | "Aggressive";
  notificationPreference: "Email" | "Slack" | "Both";
  defaultCurrency: string;
  teamMembers: TeamMember[];
};
