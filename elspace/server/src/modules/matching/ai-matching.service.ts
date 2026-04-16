// server/src/modules/matching/ai-matching.service.ts
import { prisma } from '../../database/prisma'

export class AIMatchingService {
  async matchFreelancersToProject(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    })

    if (!project) throw new Error('Project not found')

    const freelancers = await prisma.freelancerProfile.findMany({
      where: {
        availableForHire: true,
        verificationLevel: { in: ['VERIFIED', 'PREMIUM'] },
      },
      include: {
        user: true,
        profile: { include: { skills: true } },
      },
    })

    // Calculate match scores based on:
    // - Skill overlap (weight: 40%)
    // - Budget alignment (weight: 25%)
    // - Past project success rate (weight: 20%)
    // - Response time (weight: 10%)
    // - Location/timezone (weight: 5%)

    const scored = freelancers.map((freelancer: any) => {
      const skillMatch = this.calculateSkillMatch(project.skills, freelancer.profile.skills)
      const budgetMatch = this.calculateBudgetMatch(project, freelancer)
      const successRate = freelancer.completedProjects > 0 
        ? (freelancer.profile.completedProjects / (freelancer.profile.completedProjects + 2)) * 100 
        : 50
      
      const score = (skillMatch * 0.4) + (budgetMatch * 0.25) + (successRate * 0.2) + 
                    (freelancer.avgResponseTime ? Math.max(0, 100 - freelancer.avgResponseTime) * 0.1 : 5)

      return { freelancer, score }
    })

    return scored.sort((a, b) => b.score - a.score).slice(0, 5)
  }

  private calculateSkillMatch(required: string[], available: any[]): number {
    const availableNames = available.map(s => s.name.toLowerCase())
    const matched = required.filter(skill => 
      availableNames.some(name => name.includes(skill.toLowerCase()))
    )
    return (matched.length / required.length) * 100
  }

  private calculateBudgetMatch(project: any, freelancer: any): number {
    const hourlyRate = freelancer.profile.hourlyRate
    if (project.budgetType === 'HOURLY') {
      const expectedRate = project.budgetMin
      if (hourlyRate <= expectedRate) return 100
      if (hourlyRate <= expectedRate * 1.2) return 80
      if (hourlyRate <= expectedRate * 1.5) return 50
      return 20
    }
    // Fixed price logic
    return 70 // Default for fixed price
  }
}
