const axios = require("axios");

const getLanguageById = (lang) => {
  const languageMap = {
    "c++": { language: "cpp", version: "10.2.0" },
    "java": { language: "java", version: "15.0.2" },
    "javascript": { language: "javascript", version: "18.15.0" }
  };
  return languageMap[lang.toLowerCase()];
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
      stdin: input
    }
  );

  return response.data.run;
};

module.exports = { getLanguageById, runCodeWithPiston };
