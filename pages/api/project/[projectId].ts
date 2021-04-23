import { Project } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { AuthService } from "../../../service/auth.service";
import { ProjectService } from "../../../service/project.service";
import { prisma } from "../../../utils.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const authService = new AuthService(req, res)
  const projectService = new ProjectService(req)

  if (req.method === 'PUT') {
    const { projectId } = req.query as {
      projectId: string
    }
    const body = req.body as {
      enableNotification?: boolean,
    }

    const project = (await projectService.get(projectId, {
      select: {
        ownerId: true,
      },
    })) as Pick<Project, 'ownerId'>

    if (!(await authService.projectOwnerGuard(project))) {
      return
    }

    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        enableNotification: body.enableNotification
      },
    })

    res.json({
      message: 'success'
    })
  }
}