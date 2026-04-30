import { Request, Response } from 'express';
import mongoose from 'mongoose';
import CommunityFeed, { FeedCategory, FeedStatus } from '../models/communityFeed.model';

// GET /api/feed — All residents: browse community feed
export const getFeed = async (req: Request, res: Response) => {
  try {
    const { category, status = FeedStatus.ACTIVE, page = '1', limit = '20' } = req.query as {
      category?: string; status?: string; page?: string; limit?: string;
    };
    const filter: Record<string, unknown> = { status };
    if (category) filter.category = category;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      CommunityFeed.find(filter)
        .populate('postedBy', 'name unit avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CommunityFeed.countDocuments(filter),
    ]);
    return res.json({
      success: true,
      data: { posts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
      message: 'Community feed fetched',
    });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// POST /api/feed — Resident: create a post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, description, category, price, imageUrl, contactPhone } = req.body as {
      title: string; description: string; category: FeedCategory;
      price?: number; imageUrl?: string; contactPhone?: string;
    };
    if (!title || !description || !category) {
      return res.status(400).json({ success: false, data: null, message: 'title, description, and category are required' });
    }
    if (!Object.values(FeedCategory).includes(category)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid category' });
    }
    const user = req.user as { id: string; unit?: string };
    const post = await CommunityFeed.create({
      title, description, category, price, imageUrl, contactPhone,
      postedBy: user.id, unit: user.unit,
    });
    const populated = await post.populate('postedBy', 'name unit avatar');
    return res.status(201).json({ success: true, data: populated, message: 'Post created' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// PATCH /api/feed/:id/status — Owner or Admin: close/mark sold
export const updatePostStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: FeedStatus };
    if (!Object.values(FeedStatus).includes(status)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid status' });
    }
    const post = await CommunityFeed.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, data: null, message: 'Post not found' });
    const userId = (req.user as { id: string; role: string }).id;
    const userRole = (req.user as { id: string; role: string }).role;
    if (post.postedBy.toString() !== userId && !['admin', 'superuser'].includes(userRole)) {
      return res.status(403).json({ success: false, data: null, message: 'Not authorized' });
    }
    post.status = status;
    await post.save();
    return res.json({ success: true, data: post, message: 'Post status updated' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// PATCH /api/feed/:id/like — Toggle like on a post
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: string }).id;
    const post = await CommunityFeed.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, data: null, message: 'Post not found' });
    const liked = post.likes.some(id => id.toString() === userId);
    if (liked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(new mongoose.Types.ObjectId(userId));
    }
    await post.save();
    return res.json({ success: true, data: { likes: post.likes.length, liked: !liked }, message: liked ? 'Unliked' : 'Liked' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};

// DELETE /api/feed/:id — Owner or Admin: delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await CommunityFeed.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, data: null, message: 'Post not found' });
    const userId = (req.user as { id: string; role: string }).id;
    const userRole = (req.user as { id: string; role: string }).role;
    if (post.postedBy.toString() !== userId && !['admin', 'superuser'].includes(userRole)) {
      return res.status(403).json({ success: false, data: null, message: 'Not authorized' });
    }
    await post.deleteOne();
    return res.json({ success: true, data: null, message: 'Post deleted' });
  } catch {
    return res.status(500).json({ success: false, data: null, message: 'Internal server error' });
  }
};
