import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
});

const updatePreferencesSchema = z.object({
  theme: z.enum(['dark', 'light']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    browser: z.boolean().optional(),
    fraudAlerts: z.boolean().optional(),
    systemUpdates: z.boolean().optional(),
  }).optional(),
  dashboard: z.object({
    refreshInterval: z.number().min(5).max(300).optional(),
    defaultView: z.enum(['overview', 'transactions', 'alerts']).optional(),
  }).optional(),
});

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updateData = updateProfileSchema.parse(req.body);
    
    // In a real implementation, you would update the user in the database
    // For now, we'll just return success
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        ...req.user,
        ...updateData,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In a real implementation, you would fetch user preferences from database
    // For now, return default preferences
    const defaultPreferences = {
      theme: 'dark',
      notifications: {
        email: true,
        browser: true,
        fraudAlerts: true,
        systemUpdates: false,
      },
      dashboard: {
        refreshInterval: 30,
        defaultView: 'overview',
      },
    };

    res.json({ preferences: defaultPreferences });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const preferences = updatePreferencesSchema.parse(req.body);
    
    // In a real implementation, you would save preferences to database
    // For now, we'll just return success
    
    res.json({
      message: 'Preferences updated successfully',
      preferences,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSystemSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Only admins can access system settings
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const systemSettings = {
      system: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        maxTransactionsPerMinute: 1000,
        fraudDetectionThreshold: 0.5,
      },
      security: {
        sessionTimeout: 24, // hours
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireTwoFactor: false,
      },
      notifications: {
        smtpEnabled: false,
        smtpHost: '',
        smtpPort: 587,
        webhookUrl: '',
      },
      database: {
        connectionPoolSize: 10,
        queryTimeout: 30, // seconds
        backupRetentionDays: 30,
      },
    };

    res.json({ settings: systemSettings });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSystemSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Only admins can update system settings
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const settings = req.body;
    
    // In a real implementation, you would validate and update system settings
    // For now, we'll just return success
    
    res.json({
      message: 'System settings updated successfully',
      settings,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
