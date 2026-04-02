import mongoose from "mongoose";
import { config } from "dotenv";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Product } from "../models/Products";
config();
const DEMO_CREATORS = [
  { name: "Sandip Pokharel", email: "sandip@demo.com", phone: "9800000001", username: "sandippokharel", password: "demo123", role: "creator" },
  { name: "Jenish Acharya", email: "jenish@demo.com", phone: "9800000002", username: "jenishacharya", password: "demo123", role: "creator" },
  { name: "Sobin Upreti", email: "sobin@demo.com", phone: "9800000003", username: "sobinupreti", password: "demo123", role: "creator" },
  { name: "Sushant Acharya", email: "sushant@demo.com", phone: "9800000004", username: "sushantacharya", password: "demo123", role: "creator" }
];
const DEMO_PRODUCTS = [
  // DIGITAL ART - Sandip (same category + same creator demo)
  { name: "Abstract Art Pack Vol 1", description: "Beautiful abstract digital art collection with vibrant colors and modern designs", price: 25, category: "digital-art", tags: ["abstract", "modern", "colorful", "art"], coverImage: "https://picsum.photos/seed/abstract1/400/300" },
  { name: "Abstract Art Pack Vol 2", description: "Second volume of abstract digital art with more vibrant designs", price: 28, category: "digital-art", tags: ["abstract", "modern", "colorful", "art"], coverImage: "https://picsum.photos/seed/abstract2/400/300" },
  { name: "Modern Digital Paintings", description: "Contemporary digital paintings with abstract influences", price: 30, category: "digital-art", tags: ["abstract", "painting", "contemporary"], coverImage: "https://picsum.photos/seed/paintings1/400/300" },
  
  // DIGITAL ART - Jenish (same category, different creator)
  { name: "Geometric Art Bundle", description: "Geometric shapes and patterns for modern design projects", price: 22, category: "digital-art", tags: ["geometric", "patterns", "shapes", "modern"], coverImage: "https://picsum.photos/seed/geometric1/400/300" },
  { name: "Geometric Patterns Pro", description: "Advanced geometric patterns and shapes collection", price: 35, category: "digital-art", tags: ["geometric", "patterns", "shapes", "pro"], coverImage: "https://picsum.photos/seed/geometric2/400/300" },
  
  // PHOTOGRAPHY - Jenish
  { name: "Kathmandu Street Photography", description: "Street photography from the streets of Kathmandu valley", price: 40, category: "photography", tags: ["urban", "street", "kathmandu", "nepal"], coverImage: "https://picsum.photos/seed/ktm1/400/300" },
  { name: "Nepal Night Photography", description: "Night time photography capturing the beauty of Nepal", price: 45, category: "photography", tags: ["night", "nepal", "city", "photography"], coverImage: "https://picsum.photos/seed/nepal1/400/300" },
  
  // PHOTOGRAPHY - Sobin
  { name: "Himalayan Landscape Pack", description: "Beautiful landscape photography from the Himalayas", price: 35, category: "photography", tags: ["himalaya", "landscape", "mountain", "nature"], coverImage: "https://picsum.photos/seed/himalaya1/400/300" },
  { name: "Wildlife of Nepal", description: "Stunning wildlife photography from Nepal's national parks", price: 50, category: "photography", tags: ["wildlife", "nepal", "nature", "animals"], coverImage: "https://picsum.photos/seed/wildlife1/400/300" },
  
  // MUSIC - Sobin
  { name: "Lo-Fi Beats Pack", description: "Chill lo-fi hip hop beats for content creators", price: 20, category: "music", tags: ["lo-fi", "beats", "hip-hop", "chill"], coverImage: "https://picsum.photos/seed/lofi1/400/300" },
  { name: "Lo-Fi Beats Vol 2", description: "More chill lo-fi beats and instrumentals", price: 22, category: "music", tags: ["lo-fi", "beats", "hip-hop", "chill"], coverImage: "https://picsum.photos/seed/lofi2/400/300" },
  { name: "Chill Hop Collection", description: "Relaxing chill hop and lo-fi inspired tracks", price: 25, category: "music", tags: ["chill", "hop", "lo-fi", "relaxing"], coverImage: "https://picsum.photos/seed/chillhop1/400/300" },
  
  // MUSIC - Sushant
  { name: "Electronic Music Pack", description: "High energy electronic dance music tracks", price: 30, category: "music", tags: ["electronic", "dance", "edm", "energy"], coverImage: "https://picsum.photos/seed/electronic1/400/300" },
  { name: "EDM Festival Pack", description: "Festival ready electronic dance music", price: 35, category: "music", tags: ["electronic", "dance", "edm", "festival"], coverImage: "https://picsum.photos/seed/edm1/400/300" },
  
  // TEMPLATES - Sushant
  { name: "Social Media Templates", description: "Professional social media post templates", price: 15, category: "templates", tags: ["social", "media", "marketing", "posts"], coverImage: "https://picsum.photos/seed/social1/400/300" },
  { name: "Social Media Kit Pro", description: "Complete social media template kit with stories and posts", price: 18, category: "templates", tags: ["social", "media", "marketing", "kit"], coverImage: "https://picsum.photos/seed/social2/400/300" },
  
  // TEMPLATES - Sandip
  { name: "Business Card Templates", description: "Professional business card design templates", price: 12, category: "templates", tags: ["business", "cards", "professional", "design"], coverImage: "https://picsum.photos/seed/bizcard1/400/300" },
  { name: "Resume Templates Bundle", description: "Modern resume and CV templates for job seekers", price: 15, category: "templates", tags: ["resume", "cv", "professional", "career"], coverImage: "https://picsum.photos/seed/resume1/400/300" },
  
  // GRAPHICS - Jenish
  { name: "Icon Pack Essentials", description: "Essential icon set for UI and web design", price: 20, category: "graphics", tags: ["icons", "ui", "web", "design"], coverImage: "https://picsum.photos/seed/icons1/400/300" },
  { name: "UI Icon Bundle", description: "Complete UI icon collection for modern interfaces", price: 25, category: "graphics", tags: ["icons", "ui", "interface", "bundle"], coverImage: "https://picsum.photos/seed/icons2/400/300" },
  
  // 3D MODELS - Sushant
  { name: "3D Furniture Pack", description: "Modern 3D furniture models for interior visualization", price: 45, category: "3d-models", tags: ["3d", "furniture", "interior", "models"], coverImage: "https://picsum.photos/seed/furniture1/400/300" },
  { name: "3D Interior Elements", description: "Interior design 3D elements and accessories", price: 50, category: "3d-models", tags: ["3d", "interior", "design", "elements"], coverImage: "https://picsum.photos/seed/interior1/400/300" },
  
  // E-BOOKS - Sobin
  { name: "Photography E-Book", description: "Complete guide to professional photography techniques", price: 10, category: "e-books", tags: ["photography", "guide", "tutorial", "techniques"], coverImage: "https://picsum.photos/seed/ebook1/400/300" },
  { name: "Photography Masterclass", description: "Advanced photography techniques and tips", price: 12, category: "e-books", tags: ["photography", "masterclass", "advanced", "techniques"], coverImage: "https://picsum.photos/seed/ebook2/400/300" },
  
  // SOFTWARE - Sandip
  { name: "Design Software Plugin", description: "Professional design software plugin pack", price: 30, category: "software", tags: ["plugin", "design", "software", "professional"], coverImage: "https://picsum.photos/seed/plugin1/400/300" },
  { name: "Productivity Software Tools", description: "Productivity tools and software utilities", price: 35, category: "software", tags: ["productivity", "tools", "software", "utilities"], coverImage: "https://picsum.photos/seed/tools1/400/300" },
  
  // VIDEOS - Jenish
  { name: "Motion Graphics Pack", description: "Animated motion graphics for video projects", price: 40, category: "videos", tags: ["motion", "graphics", "video", "animation"], coverImage: "https://picsum.photos/seed/motion1/400/300" },
  { name: "Video Transitions Pack", description: "Smooth video transitions and effects", price: 25, category: "videos", tags: ["video", "transitions", "effects", "smooth"], coverImage: "https://picsum.photos/seed/transitions1/400/300" }
];
async function seedDatabase() {
  try {
    console.log("🔗 Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to database");
    console.log("\n🗑️  Clearing existing demo data...");
    await User.deleteMany({ email: { $regex: /@demo\.com$/ } });
    await Product.deleteMany({ coverImage: { $regex: /picsum\.photos/ } });
    console.log("✅ Demo data cleared");
    console.log("\n👥 Creating demo creators...");
    const creators: any[] = [];
    for (const creator of DEMO_CREATORS) {
      const hashedPassword = await bcrypt.hash(creator.password, 12);
      const user = await User.create({ ...creator, password: hashedPassword });
      creators.push(user);
      console.log(`   ✅ Created: ${creator.name} (${creator.username})`);
    }
    console.log("\n📦 Creating demo products...");
    let productIndex = 0;
    for (const productData of DEMO_PRODUCTS) {
      const creatorIndex = productIndex % creators.length;
      const creator = creators[creatorIndex];
      await Product.create({ ...productData, owner: creator._id, publishedDate: new Date(), files: [] });
      console.log(`   ✅ Created: ${productData.name} (by ${creator.name})`);
      productIndex++;
    }
    console.log("\n🎉 SEED COMPLETE!");
    console.log(`\n📊 Created: ${creators.length} creators, ${DEMO_PRODUCTS.length} products`);
    console.log(`\n🔑 Demo login (password: demo123): sandippokharel, jenishacharya, sobinupreti, sushantacharya`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}
seedDatabase();