// pages/api/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { NextApiRequest, NextApiResponse } from "next";

const f = createUploadthing();

export const fileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This is the recommended way for Next.js pages/api
  // @ts-ignore
  return await fileRouter.imageUploader.apiRoute(req, res);
}