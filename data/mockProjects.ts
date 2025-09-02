import { Project, ProjectSummary } from "../types";

// Sample projects for development and testing
export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Modern Master Bathroom Renovation",
    category: "bathroom",
    briefDescription:
      "Complete bathroom transformation with walk-in shower and double vanity",
    longDescription:
      "This master bathroom renovation transformed a dated 1980s bathroom into a modern, spa-like retreat. Features include a custom walk-in shower with multiple shower heads, double vanity with quartz countertops, freestanding soaking tub, and heated floors throughout.",
    thumbnail:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    pictures: [
      {
        id: "1-1",
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
        altText: "Before: Dated bathroom with old fixtures",
        type: "before",
        description: "Original bathroom condition",
        order: 1,
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "1-2",
        url: "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=400&h=300&fit=crop",
        altText: "After: Modern bathroom with walk-in shower",
        type: "after",
        description: "Completed renovation",
        order: 2,
        createdAt: new Date("2024-01-15"),
      },
    ],
    documents: [
      {
        id: "doc-1",
        name: "Bathroom Renovation Contract",
        type: "contract",
        url: "#",
        fileType: "PDF",
        description: "Project contract and specifications",
        uploadedAt: new Date("2024-01-10"),
      },
    ],
    logs: [
      {
        id: "log-1",
        projectId: "1",
        type: "milestone",
        title: "Project Started",
        description: "Demolition and preparation work began",
        date: new Date("2024-01-10"),
        author: "Mike Johnson",
        status: "completed",
      },
    ],
    location: "Austin, TX - Northwest",
    clientInfo: {
      name: "Sarah & David Chen",
      address: "1234 Oak Ridge Dr, Austin, TX 78750",
      phone: "(512) 555-0123",
      email: "sarah.chen@email.com",
    },
    projectDates: {
      startDate: new Date("2024-01-10"),
      completionDate: new Date("2024-02-15"),
      estimatedCompletion: new Date("2024-02-20"),
    },
    status: "completed",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-02-15"),
    tags: [
      "master bathroom",
      "walk-in shower",
      "heated floors",
      "quartz countertops",
    ],
    estimatedCost: 45000,
    actualCost: 43200,
  },
  {
    id: "2",
    name: "Kitchen Island Addition & Remodel",
    category: "kitchen",
    briefDescription:
      "Added custom kitchen island and updated cabinets and countertops",
    longDescription:
      "This kitchen remodel focused on creating a more functional cooking space by adding a custom kitchen island with seating for four, updating all cabinets to shaker style with soft-close hinges, and installing quartz countertops throughout. The project also included new lighting fixtures and a farmhouse sink.",
    thumbnail:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    pictures: [
      {
        id: "2-1",
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
        altText: "Before: Kitchen without island",
        type: "before",
        description: "Original kitchen layout",
        order: 1,
        createdAt: new Date("2024-02-01"),
      },
      {
        id: "2-2",
        url: "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=400&h=300&fit=crop",
        altText: "After: Kitchen with custom island",
        type: "after",
        description: "Completed kitchen with island",
        order: 2,
        createdAt: new Date("2024-02-01"),
      },
    ],
    documents: [
      {
        id: "doc-2",
        name: "Kitchen Remodel Permit",
        type: "permit",
        url: "#",
        fileType: "PDF",
        description: "City building permit",
        uploadedAt: new Date("2024-01-25"),
      },
    ],
    logs: [
      {
        id: "log-2",
        projectId: "2",
        type: "milestone",
        title: "Island Construction Complete",
        description: "Custom island frame and countertop installed",
        date: new Date("2024-02-20"),
        author: "Mike Johnson",
        status: "completed",
      },
    ],
    location: "Austin, TX - Central",
    clientInfo: {
      name: "Maria Rodriguez",
      address: "5678 Cedar Ave, Austin, TX 78701",
      phone: "(512) 555-0456",
      email: "maria.rodriguez@email.com",
    },
    projectDates: {
      startDate: new Date("2024-01-25"),
      estimatedCompletion: new Date("2024-03-15"),
    },
    status: "in-progress",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-02-20"),
    tags: [
      "kitchen island",
      "cabinet update",
      "quartz countertops",
      "farmhouse sink",
    ],
    estimatedCost: 28000,
  },
  {
    id: "3",
    name: "Outdoor Deck & Patio Extension",
    category: "outdoor",
    briefDescription: "Extended existing deck and added covered patio area",
    longDescription:
      "This outdoor project extended the existing deck by 200 square feet and added a covered patio area with ceiling fans and outdoor lighting. The project included new composite decking, custom railing, and a pergola structure for the covered area.",
    thumbnail:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    pictures: [
      {
        id: "3-1",
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
        altText: "Before: Small existing deck",
        type: "before",
        description: "Original deck size",
        order: 1,
        createdAt: new Date("2024-03-01"),
      },
      {
        id: "3-2",
        url: "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=400&h=300&fit=crop",
        altText: "After: Extended deck with covered patio",
        type: "after",
        description: "Completed outdoor space",
        order: 2,
        createdAt: new Date("2024-03-01"),
      },
    ],
    documents: [
      {
        id: "doc-3",
        name: "Deck Construction Invoice",
        type: "invoice",
        url: "#",
        fileType: "PDF",
        description: "Final project invoice",
        uploadedAt: new Date("2024-04-01"),
      },
    ],
    logs: [
      {
        id: "log-3",
        projectId: "3",
        type: "completion",
        title: "Project Completed",
        description: "Deck extension and patio cover finished",
        date: new Date("2024-04-01"),
        author: "Mike Johnson",
        status: "completed",
      },
    ],
    location: "Austin, TX - Southwest",
    clientInfo: {
      name: "Robert & Lisa Thompson",
      address: "9012 Pine Valley Rd, Austin, TX 78735",
      phone: "(512) 555-0789",
      email: "robert.thompson@email.com",
    },
    projectDates: {
      startDate: new Date("2024-03-01"),
      completionDate: new Date("2024-04-01"),
      estimatedCompletion: new Date("2024-04-15"),
    },
    status: "completed",
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-04-01"),
    tags: [
      "deck extension",
      "covered patio",
      "composite decking",
      "outdoor lighting",
    ],
    estimatedCost: 18500,
    actualCost: 18200,
  },
];

// Helper function to get projects by category
export const getProjectsByCategory = (category: string): Project[] => {
  return mockProjects.filter((project) => project.category === category);
};

// Helper function to get project summaries for list views
export const getProjectSummaries = (): ProjectSummary[] => {
  return mockProjects.map((project) => ({
    id: project.id,
    name: project.name,
    category: project.category,
    briefDescription: project.briefDescription,
    thumbnail: project.thumbnail,
    status: project.status,
    completedAt: project.projectDates?.completionDate,
  }));
};

// Helper function to get project summaries by category
export const getProjectSummariesByCategory = (
  category: string
): ProjectSummary[] => {
  return getProjectsByCategory(category).map((project) => ({
    id: project.id,
    name: project.name,
    category: project.category,
    briefDescription: project.briefDescription,
    thumbnail: project.thumbnail,
    status: project.status,
    completedAt: project.projectDates?.completionDate,
  }));
};
