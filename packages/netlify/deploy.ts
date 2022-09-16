import axios from "axios";
import crypto from "crypto";
import fs from "fs";

export const deploy = async ({
  folderPath,
  siteId,
  authorizationToken,
  draft,
}: {
  folderPath: string;
  siteId: string;
  authorizationToken: string;
  draft: boolean;
}) => {
  const getSha1 = (file: string) =>
    crypto
      .createHash("sha1")
      .update(fs.readFileSync(`${folderPath}/${file}`))
      .digest("hex");

  const { data } = await axios.post(
    `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
    {
      files: {
        "report.html": getSha1("report.html"),
        "report.js": getSha1("report.js"),
      },
      draft,
    },
    {
      headers: {
        Authorization: `Bearer ${authorizationToken}`,
      },
    }
  );

  const deployId = data.id;

  await Promise.all(
    ["report.html", "report.js"].map((file) => {
      return axios.put(
        `https://api.netlify.com/api/v1/deploys/${deployId}/files/${file}`,
        fs.readFileSync(`${folderPath}/${file}`),
        {
          headers: {
            Authorization: `Bearer ${authorizationToken}`,
            "Content-Type": "application/octet-stream",
          },
        }
      );
    })
  );

  return `${data.deploy_url}/report.html`;
};
