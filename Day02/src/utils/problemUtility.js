const axios = require("axios");

const getLanguageById = (lang) => {
  if (!lang) return { language: "javascript", version: "18.15.0" };
  const normalized = lang.toString().toLowerCase().trim();
  const languageMap = {
    "c++": { language: "cpp", version: "10.2.0" },
    "cpp": { language: "cpp", version: "10.2.0" },
    "java": { language: "java", version: "15.0.2" },
    "javascript": { language: "javascript", version: "18.15.0" },
    "js": { language: "javascript", version: "18.15.0" },
    "python": { language: "python", version: "3.10.0" },
    "python3": { language: "python", version: "3.10.0" },
    "py": { language: "python", version: "3.10.0" }
  };
  return languageMap[normalized] || { language: normalized, version: "*" };
};

const runCodeWithPiston = async ({ language, code, input }) => {
  const langConfig = getLanguageById(language);

  const response = await axios.post(
    "https://emkc.org/api/v2/piston/execute",
    {
      language: langConfig.language,
      version: langConfig.version,
      files: [
        {
          content: code
        }
      ],
      stdin: input || ""
    },
    { timeout: 15000 }
  );

  return response.data.run || response.data;
};

module.exports = { getLanguageById, runCodeWithPiston };
