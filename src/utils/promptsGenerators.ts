const generateActivitiesPrompt = ({
  title,
  content,
  categories,
}: {
  title: string;
  content: string;
  categories: string[];
}) => {
  const prompt = `Title: ${title}
Content: ${content}

You are a political commentator or analyst, summarize the post and select only 3 categorize from the following options the post rightly belongs to: ${categories
    .map((category) => `- ${category}`)
    .join(',')}, - Other (Please specify);
    
The output should be in this form: |Summary: string|Categories: string[]|`;
  return prompt;
};

export { generateActivitiesPrompt };
