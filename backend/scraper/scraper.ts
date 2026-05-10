import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Example target URL (usually you'd need the specific stats guru or squads page)
// We are adding a mock scraper structure as requested.
const BASE_URL = "https://www.espncricinfo.com";

interface IPLPlayer {
  name: string;
  country: string;
  role: string;
  teams: string[];
  batting_style: string;
  bowling_style: string;
  years_active: string;
}

export async function scrapePlayers() {
  console.log("Starting ESPNcricinfo IPL players scraper...");
  const players: IPLPlayer[] = [];

  try {
    // In a real scenario, we would iterate over squad pages or search results.
    // Due to request constraints and structure changes, here is a functional example
    // of how you would fetch and parse a team page.
    
    // For demonstration, let's say we have a list of team URLs
    const teamUrls = [
      // Mock URL, replace with actual team squad URLs
      "https://www.espncricinfo.com/series/indian-premier-league-2024-1410320/squads"
    ];

    for (const url of teamUrls) {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });
      const $ = cheerio.load(response.data);

      // Example parsing logic (selectors need to match ESPNcricinfo's current DOM format)
      $(".player-card").each((i, el) => {
        const name = $(el).find(".player-name").text().trim();
        const role = $(el).find(".player-role").text().trim();
        const batting = $(el).find(".batting-style").text().trim();
        const bowling = $(el).find(".bowling-style").text().trim();
        
        if (name) {
          players.push({
            name,
            country: "India", // Usually need to click into profile to get country
            role: role || "Unknown",
            teams: ["Unknown"],
            batting_style: batting || "Unknown",
            bowling_style: bowling || "Unknown",
            years_active: "2024"
          });
        }
      });
    }

    // Remove duplicates
    const uniquePlayers = Array.from(new Set(players.map(p => p.name)))
      .map(name => {
        return players.find(p => p.name === name)!;
      });

    // Save to players.json
    const outPath = path.join(process.cwd(), "data", "players.json");
    fs.writeFileSync(outPath, JSON.stringify(uniquePlayers, null, 2));
    console.log(`Saved ${uniquePlayers.length} players to ${outPath}`);

  } catch (error) {
    console.error("Error scraping players:", error);
  }
}

// Allow running directly
if (process.argv[1] === __filename) {
  scrapePlayers();
}
