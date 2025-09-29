import mongoose from "mongoose";

const KnowledgeBaseSchema = new mongoose.Schema({
  content: {
    type: String, // The actual chunk of Bas’s insight
    required: true,
  },
  embedding: {
    type: [Number], // Vector embedding (float array)
    required: true,
    index: "vector", // Atlas Vector Index will use this
  },
  metadata: {
    topic: {
      type: String, // hook | caption | pacing | audio | flow | viral_predictor
      required: true,
      index: true,
    },
    layer: {
      type: String, // raw | pattern | example
      required: true,
      index: true,
    },
    video_id: {
      type: String, // Link to original Bas video (if available)
      default: null,
    },
    views: {
      type: Number, // View count (for re-ranking)
      default: null,
    },
    author: {
      type: String, // Usually "Bas", but flexible for future contributors
      default: "Bas",
    },
    date: {
      type: Date, // Date of content/insight creation
      default: Date.now,
      index: true,
    },
    source: {
      type: String, // transcript | breakdown | manual_note | trend_scrape
      default: "manual_note",
    },
    tags: {
      type: [String], // Extra filters like ["psychology", "storytelling"]
      default: [],
    },
    confidence: {
      type: Number, // Optional score (0–1) for ranking certainty
      default: null,
    },
  },
});

export default mongoose.model("KnowledgeBase", KnowledgeBaseSchema);
