import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
  articles: [
    {
      article_id: String,
      title: String,
      link: String,
      keywords: [String],
      creator: [String],
      description: String,
      pubDate: String,
      image_url: String,
      source_name: String,
    }
  ],
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('News', NewsSchema);
