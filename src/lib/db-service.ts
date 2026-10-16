import { prisma } from './prisma';
import { ActionType } from '@/types';

// In-memory fallback store for offline/local evaluation without active PostgreSQL instance
interface InMemoryUser {
  id: string;
  email: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

interface InMemoryHistory {
  id: string;
  userId: string;
  amount: number;
  action: ActionType;
  description: string;
  createdAt: Date;
}

interface InMemoryImage {
  id: string;
  userId: string;
  originalUrl: string;
  enhancedUrl: string;
  scaleFactor: number;
  createdAt: Date;
}

const memoryStore = {
  users: new Map<string, InMemoryUser>(),
  history: [] as InMemoryHistory[],
  images: [] as InMemoryImage[],
};

// Seed a default demo user in memory fallback
const DEFAULT_DEMO_USER: InMemoryUser = {
  id: 'usr_demo_pixellift',
  email: 'demo@pixellift.ai',
  credits: 5, // Give 5 free starter credits in mock/demo
  createdAt: new Date(),
  updatedAt: new Date(),
};
memoryStore.users.set(DEFAULT_DEMO_USER.id, DEFAULT_DEMO_USER);
memoryStore.users.set(DEFAULT_DEMO_USER.email, DEFAULT_DEMO_USER);

export async function getOrCreateUser(identifier: { id?: string; email?: string }) {
  const email = identifier.email || (identifier.id ? `${identifier.id}@pixellift.internal` : 'demo@pixellift.ai');
  const id = identifier.id || 'usr_demo_pixellift';

  try {
    // Try Prisma DB first
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { email }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id,
          email,
          credits: 5, // Give 5 welcome credits for new testing users
          creditHistory: {
            create: {
              amount: 5,
              action: 'PURCHASE',
              description: 'Welcome bonus: 5 complimentary credits',
            },
          },
        },
      });
    }

    return user;
  } catch (error) {
    console.warn('[DB Service] PostgreSQL unreachable, using memory fallback:', (error as Error).message);
    let memUser = memoryStore.users.get(id) || memoryStore.users.get(email);
    if (!memUser) {
      memUser = {
        id,
        email,
        credits: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.set(id, memUser);
      memoryStore.users.set(email, memUser);
      memoryStore.history.push({
        id: `ch_${Date.now()}`,
        userId: id,
        amount: 5,
        action: 'PURCHASE',
        description: 'Welcome bonus: 5 complimentary credits',
        createdAt: new Date(),
      });
    }
    return memUser;
  }
}

export async function addCredits(userId: string, amount: number, description: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.upsert({
        where: { id: userId },
        update: { credits: { increment: amount } },
        create: {
          id: userId,
          email: `${userId}@user.pixellift.ai`,
          credits: amount,
        },
      });

      const history = await tx.creditHistory.create({
        data: {
          userId: updatedUser.id,
          amount,
          action: 'PURCHASE',
          description,
        },
      });

      return { user: updatedUser, history };
    });
  } catch (error) {
    console.warn('[DB Service] Fallback credit addition:', (error as Error).message);
    const user = memoryStore.users.get(userId) || DEFAULT_DEMO_USER;
    user.credits += amount;
    user.updatedAt = new Date();

    const historyRecord: InMemoryHistory = {
      id: `ch_${Date.now()}`,
      userId,
      amount,
      action: 'PURCHASE',
      description,
      createdAt: new Date(),
    };
    memoryStore.history.unshift(historyRecord);

    return { user, history: historyRecord };
  }
}

export async function deductCreditAndSaveImage(
  userId: string,
  originalUrl: string,
  enhancedUrl: string,
  scaleFactor: number = 4
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.credits < 1) {
        throw new Error('Insufficient credits');
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } },
      });

      const history = await tx.creditHistory.create({
        data: {
          userId,
          amount: -1,
          action: 'USAGE',
          description: `Upscaled image (${scaleFactor}x enhancement)`,
        },
      });

      const imageRecord = await tx.imageResult.create({
        data: {
          userId,
          originalUrl,
          enhancedUrl,
          scaleFactor,
        },
      });

      return { user: updatedUser, history, imageRecord };
    });
  } catch (error) {
    console.warn('[DB Service] Fallback credit deduction & image save:', (error as Error).message);
    const user = memoryStore.users.get(userId) || DEFAULT_DEMO_USER;
    if (user.credits < 1) {
      throw new Error('Insufficient credits');
    }
    user.credits -= 1;
    user.updatedAt = new Date();

    const historyRecord: InMemoryHistory = {
      id: `ch_${Date.now()}`,
      userId,
      amount: -1,
      action: 'USAGE',
      description: `Upscaled image (${scaleFactor}x enhancement)`,
      createdAt: new Date(),
    };
    memoryStore.history.unshift(historyRecord);

    const imageRecord: InMemoryImage = {
      id: `img_${Date.now()}`,
      userId,
      originalUrl,
      enhancedUrl,
      scaleFactor,
      createdAt: new Date(),
    };
    memoryStore.images.unshift(imageRecord);

    return { user, history: historyRecord, imageRecord };
  }
}

export async function getUserHistoryAndImages(userId: string) {
  try {
    const [history, images, user] = await Promise.all([
      prisma.creditHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.imageResult.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.user.findUnique({
        where: { id: userId },
      }),
    ]);

    return {
      user,
      history,
      images,
    };
  } catch (error) {
    console.warn('[DB Service] Fallback getUserHistoryAndImages:', (error as Error).message);
    const user = memoryStore.users.get(userId) || DEFAULT_DEMO_USER;
    const history = memoryStore.history.filter((h) => h.userId === userId);
    const images = memoryStore.images.filter((img) => img.userId === userId);

    return {
      user,
      history,
      images,
    };
  }
}
