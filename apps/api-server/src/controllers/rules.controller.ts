import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const createRuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  condition: z.string(), // JSON string for rule conditions
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

const updateRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  condition: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  isActive: z.boolean().optional(),
});

export const getAllRules = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rules = await prisma.fraudRule.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        severity: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
    });

    res.json({ rules });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRuleById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const rule = await prisma.fraudRule.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        description: true,
        condition: true,
        severity: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
    });

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.json({ rule });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ruleData = createRuleSchema.parse(req.body);
    
    const rule = await prisma.fraudRule.create({
      data: {
        ...ruleData,
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({
      message: 'Rule created successfully',
      rule,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = updateRuleSchema.parse(req.body);
    
    const rule = await prisma.fraudRule.update({
      where: { id: id as string },
      data: updateData,
    });

    res.json({
      message: 'Rule updated successfully',
      rule,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.fraudRule.delete({
      where: { id: id as string },
    });

    res.json({ message: 'Rule deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const rule = await prisma.fraudRule.findUnique({
      where: { id: id as string },
      select: { isActive: true },
    });

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    const updatedRule = await prisma.fraudRule.update({
      where: { id: id as string },
      data: { isActive: !rule.isActive },
    });

    res.json({
      message: `Rule ${updatedRule.isActive ? 'activated' : 'deactivated'} successfully`,
      rule: updatedRule,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
