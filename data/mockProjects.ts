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
      completionDate: new Date("2024-02-20"),
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
  {
    id: "4",
    name: "Guest Bathroom Refresh",
    category: "bathroom",
    briefDescription:
      "Updated fixtures, paint, and lighting for a modern guest bathroom",
    longDescription:
      "This guest bathroom refresh focused on modernizing the space with new fixtures, fresh paint, updated lighting, and new hardware. The project maintained the existing layout while giving it a fresh, contemporary look.",
    thumbnail:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    pictures: [
      {
        id: "4-1",
        url: "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=400&h=300&fit=crop",
        altText: "Before: Outdated guest bathroom",
        type: "before",
        description: "Original guest bathroom",
        order: 1,
        createdAt: new Date("2024-02-01"),
      },
      {
        id: "4-2",
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
        altText: "After: Refreshed guest bathroom",
        type: "after",
        description: "Updated bathroom with modern fixtures",
        order: 2,
        createdAt: new Date("2024-02-01"),
      },
    ],
    documents: [
      {
        id: "doc-4",
        name: "Guest Bathroom Update Contract",
        type: "contract",
        url: "#",
        fileType: "PDF",
        description: "Project contract and specifications",
        uploadedAt: new Date("2024-01-25"),
      },
    ],
    logs: [
      {
        id: "log-4",
        projectId: "4",
        type: "milestone",
        title: "Project Started",
        description: "Fixtures and materials ordered",
        date: new Date("2024-01-25"),
        author: "Mike Johnson",
        status: "completed",
      },
    ],
    location: "Austin, TX - Central",
    clientInfo: {
      name: "Jennifer Martinez",
      address: "5678 Cedar Ave, Austin, TX 78701",
      phone: "(512) 555-0456",
      email: "jennifer.martinez@email.com",
    },
    projectDates: {
      startDate: new Date("2024-01-25"),
      completionDate: new Date("2024-02-10"),
      estimatedCompletion: new Date("2024-02-15"),
    },
    status: "completed",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-02-10"),
    tags: [
      "guest bathroom",
      "fixtures update",
      "paint refresh",
      "lighting update",
    ],
    estimatedCost: 8500,
    actualCost: 8200,
  },
  {
    id: "5",
    name: "Powder Room Transformation",
    category: "bathroom",
    briefDescription:
      "Complete powder room makeover with custom vanity and tile work",
    longDescription:
      "This powder room transformation included custom vanity construction, new tile flooring and wall tiles, updated lighting, and a new mirror. The space was completely redesigned to maximize functionality in a small footprint.",
    thumbnail:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    pictures: [
      {
        id: "5-1",
        url: "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=400&h=300&fit=crop",
        altText: "Before: Basic powder room",
        type: "before",
        description: "Original powder room condition",
        order: 1,
        createdAt: new Date("2024-03-15"),
      },
      {
        id: "5-2",
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
        altText: "After: Transformed powder room",
        type: "after",
        description: "Custom vanity and tile work completed",
        order: 2,
        createdAt: new Date("2024-03-15"),
      },
    ],
    documents: [
      {
        id: "doc-5",
        name: "Powder Room Design Plan",
        type: "other",
        url: "#",
        fileType: "PDF",
        description: "Design specifications and tile layout",
        uploadedAt: new Date("2024-03-10"),
      },
    ],
    logs: [
      {
        id: "log-5",
        projectId: "5",
        type: "milestone",
        title: "Project Started",
        description: "Demolition and preparation work began",
        date: new Date("2024-03-10"),
        author: "Mike Johnson",
        status: "in-progress",
      },
    ],
    location: "Austin, TX - East",
    clientInfo: {
      name: "Michael & Amanda Rodriguez",
      address: "3456 Maple St, Austin, TX 78702",
      phone: "(512) 555-0890",
      email: "michael.rodriguez@email.com",
    },
    projectDates: {
      startDate: new Date("2024-03-10"),
      completionDate: undefined,
      estimatedCompletion: new Date("2024-04-05"),
    },
    status: "in-progress",
    createdAt: new Date("2024-03-05"),
    updatedAt: new Date("2024-03-15"),
    tags: ["powder room", "custom vanity", "tile work", "small space design"],
    estimatedCost: 12000,
    actualCost: undefined,
  },
  {
    id: "6",
    name: "Open Concept Kitchen Remodel",
    category: "kitchen",
    briefDescription:
      "Removed wall to create open concept kitchen and dining area",
    longDescription:
      "This major kitchen remodel involved removing a load-bearing wall to create an open concept kitchen and dining area. The project included new cabinets, countertops, appliances, and a kitchen island with seating.",
    thumbnail:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    pictures: [
      {
        id: "6-1",
        url: "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1584622786156-2c8c12c8a4b3?w=400&h=300&fit=crop",
        altText: "Before: Closed kitchen layout",
        type: "before",
        description: "Original closed kitchen",
        order: 1,
        createdAt: new Date("2024-01-20"),
      },
      {
        id: "6-2",
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
        altText: "After: Open concept kitchen",
        type: "after",
        description: "Open concept kitchen completed",
        order: 2,
        createdAt: new Date("2024-01-20"),
      },
    ],
    documents: [
      {
        id: "doc-6",
        name: "Kitchen Remodel Contract",
        type: "contract",
        url: "#",
        fileType: "PDF",
        description: "Project contract and structural specifications",
        uploadedAt: new Date("2024-01-15"),
      },
    ],
    logs: [
      {
        id: "log-6",
        projectId: "6",
        type: "milestone",
        title: "Project Started",
        description: "Structural work and wall removal began",
        date: new Date("2024-01-15"),
        author: "Mike Johnson",
        status: "completed",
      },
    ],
    location: "Austin, TX - North",
    clientInfo: {
      name: "David & Emily Wilson",
      address: "7890 River Bend Dr, Austin, TX 78730",
      phone: "(512) 555-0234",
      email: "david.wilson@email.com",
    },
    projectDates: {
      startDate: new Date("2024-01-15"),
      completionDate: new Date("2024-03-01"),
      estimatedCompletion: new Date("2024-03-15"),
    },
    status: "completed",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-03-01"),
    tags: [
      "open concept",
      "structural work",
      "kitchen island",
      "modern design",
    ],
    estimatedCost: 65000,
    actualCost: 62800,
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
  console.log(`🔍 Getting projects for category: "${category}"`);

  const filteredProjects = getProjectsByCategory(category);
  console.log(
    `   Found ${filteredProjects.length} projects in category "${category}"`
  );

  const summaries = filteredProjects.map((project) => ({
    id: project.id,
    name: project.name,
    category: project.category,
    briefDescription: project.briefDescription,
    thumbnail: project.thumbnail,
    status: project.status,
    completedAt: project.projectDates?.completionDate,
  }));

  console.log(
    `   Returning ${summaries.length} project summaries:`,
    summaries.map((p) => ({ id: p.id, name: p.name, thumbnail: p.thumbnail }))
  );

  return summaries;
};
