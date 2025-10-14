import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { platforms, title, description, videoUrl, scheduledFor } = await request.json();

    if (!platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: "At least one platform is required" },
        { status: 400 }
      );
    }

    if (!videoUrl) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
    }

    // TODO: Get userId from authentication
    const userId = "temp-user-id";

    // Create post records for each platform
    const posts = await Promise.all(
      platforms.map(async (platformId: string) => {
        // Find the social account for this platform
        const socialAccount = await prisma.socialAccount.findFirst({
          where: {
            userId,
            platform: platformId,
          },
        });

        if (!socialAccount) {
          throw new Error(`No connected account for platform: ${platformId}`);
        }

        // Create post record
        const post = await prisma.post.create({
          data: {
            socialAccountId: socialAccount.id,
            title,
            description,
            videoUrl,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
            status: scheduledFor ? "scheduled" : "draft",
          },
        });

        // If not scheduled, publish immediately
        if (!scheduledFor) {
          // TODO: Implement actual platform publishing logic
          // This would use platform-specific APIs (YouTube Data API, Instagram Graph API, etc.)
          await publishToPlatform(post.id, platformId, {
            title,
            description,
            videoUrl,
            accessToken: socialAccount.accessToken,
          });

          // Update post status
          await prisma.post.update({
            where: { id: post.id },
            data: {
              status: "published",
              publishedAt: new Date(),
            },
          });
        }

        return post;
      })
    );

    return NextResponse.json({
      success: true,
      posts,
      message: scheduledFor
        ? `Scheduled for ${platforms.length} platform(s)`
        : `Published to ${platforms.length} platform(s)`,
    });
  } catch (error: any) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to publish" },
      { status: 500 }
    );
  }
}

async function publishToPlatform(
  postId: string,
  platform: string,
  data: {
    title: string;
    description: string;
    videoUrl: string;
    accessToken: string;
  }
) {
  // Platform-specific publishing logic
  switch (platform) {
    case "youtube":
      // YouTube Data API v3
      // POST https://www.googleapis.com/youtube/v3/videos
      break;

    case "instagram":
      // Instagram Graph API
      // POST https://graph.instagram.com/me/media
      break;

    case "tiktok":
      // TikTok API
      break;

    case "facebook":
      // Facebook Graph API
      break;

    case "linkedin":
      // LinkedIn API
      break;

    case "x":
      // X (Twitter) API v2
      break;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  // Mock implementation for now
  console.log(`Publishing to ${platform}:`, data);
  return { success: true, platformPostId: `mock-${platform}-${postId}` };
}
