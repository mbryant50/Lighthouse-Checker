import React, { useState } from "react";
import Input from "./components/ui/Input";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";

const LighthouseChecker = () => {
  const [apiKey, setApiKey] = useState("");
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [url, setUrl] = useState("");
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateApiKey = async () => {
    try {
      const testUrl = "https://example.com";
      const response = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error("Invalid API Key");
      }

      setIsApiKeyValid(true);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to validate API Key");
    }
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return { text: "Excellent", color: "text-green-600 font-bold" };
    if (score >= 80) return { text: "Good", color: "text-green-500 font-semibold" };
    if (score >= 70) return { text: "Fair", color: "text-yellow-500 font-medium" };
    if (score >= 60) return { text: "Needs Attention", color: "text-yellow-600 font-medium" };
    if (score >= 50) return { text: "Concerning", color: "text-orange-500 font-semibold" };
    if (score >= 40) return { text: "Poor", color: "text-orange-600 font-bold" };
    return { text: "Desperate", color: "text-red-600 font-extrabold" };
  };

  const fetchLighthouseScores = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setScores(null);

    try {
      const response = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=seo&category=best-practices&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data. Please check the API key and URL.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!data.lighthouseResult) {
        throw new Error("Unexpected API response structure.");
      }

      setScores({
        performance: data.lighthouseResult.categories.performance.score * 100,
        accessibility: data.lighthouseResult.categories.accessibility.score * 100,
        seo: data.lighthouseResult.categories.seo.score * 100,
        bestPractices: data.lighthouseResult.categories["best-practices"].score * 100,
      });
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-5 bg-white shadow-xl rounded-2xl">
      {!isApiKeyValid ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Enter API Key</h2>
          <Input
            type="text"
            placeholder="Enter your Google API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mb-3"
          />
          <Button onClick={validateApiKey}>Validate API Key</Button>
          {error && <p className="text-red-500 mt-3">{error}</p>}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Lighthouse Score Checker</h2>
          <Input
            type="text"
            placeholder="Enter website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mb-3"
          />
          <Button onClick={fetchLighthouseScores} disabled={loading}>
            {loading ? "Checking..." : "Check Scores"}
          </Button>
          {error && <p className="text-red-500 mt-3">{error}</p>}
          {scores && (
            <Card className="mt-5">
              <div className="p-4">
                {Object.entries(scores).map(([key, value]) => {
                  const { text, color } = getScoreLabel(value);
                  return (
                    <p key={key} className={`${color}`}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value} ({text})
                    </p>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default LighthouseChecker;
