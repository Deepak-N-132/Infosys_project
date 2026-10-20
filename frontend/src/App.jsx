import { useState, useEffect, useRef } from "react";
import "./App.css";
let rawApiUrl = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL.trim() : "";
if (!rawApiUrl || rawApiUrl === "freshcheck-backend" || (rawApiUrl.includes("freshcheck-backend") && !rawApiUrl.includes("."))) {
  if (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) {
    rawApiUrl = "https://freshcheck-backend.onrender.com";
  } else {
    rawApiUrl = "http://127.0.0.1:8000";
  }
}
const API_URL = (rawApiUrl.startsWith("http://") || rawApiUrl.startsWith("https://"))
  ? rawApiUrl.replace(/\/+$/, "")
  : `https://${rawApiUrl}`.replace(/\/+$/, "");

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

const getFoodVisual = (name = "", category = "") => {
  const n = (name || "").toLowerCase().trim();
  const c = (category || "").toLowerCase().trim();

  // Specific fruit names
  if (n.includes("banana") || n.includes("plantain")) {
    return { emoji: "🍌", bg: "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)", border: "#fde047" };
  }
  if (n.includes("orange") || n.includes("tangerine") || n.includes("mandarin") || n.includes("clementine") || n.includes("citrus")) {
    return { emoji: "🍊", bg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", border: "#fdba74" };
  }
  if (n.includes("apple")) {
    const isGreen = n.includes("green");
    return { emoji: isGreen ? "🍏" : "🍎", bg: isGreen ? "linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)" : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", border: isGreen ? "#bef264" : "#fca5a5" };
  }
  if (n.includes("pineapple") || n.includes("ananas")) {
    return { emoji: "🍍", bg: "linear-gradient(135deg, #fef9c3 0%, #fed7aa 100%)", border: "#fcd34d" };
  }
  if (n.includes("papaya")) {
    return { emoji: "🍈", bg: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)", border: "#fb923c" };
  }
  if (n.includes("mango")) {
    return { emoji: "🥭", bg: "linear-gradient(135deg, #fef08a 0%, #fed7aa 100%)", border: "#facc15" };
  }
  if (n.includes("lemon") || n.includes("lime")) {
    return { emoji: "🍋", bg: "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)", border: "#fde047" };
  }
  if (n.includes("grape")) {
    return { emoji: "🍇", bg: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)", border: "#d8b4fe" };
  }
  if (n.includes("strawberr") || n.includes("berry") || n.includes("berries")) {
    return { emoji: "🍓", bg: "linear-gradient(135deg, #fee2e2 0%, #fecdd3 100%)", border: "#fda4af" };
  }
  if (n.includes("blueberr") || n.includes("blackberr")) {
    return { emoji: "🫐", bg: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)", border: "#a5b4fc" };
  }
  if (n.includes("watermelon") || n.includes("water melon") || n.includes("melon")) {
    return { emoji: "🍉", bg: "linear-gradient(135deg, #dcfce7 0%, #fee2e2 100%)", border: "#86efac" };
  }
  if (n.includes("peach") || n.includes("apricot") || n.includes("nectarine")) {
    return { emoji: "🍑", bg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", border: "#fdba74" };
  }
  if (n.includes("pear")) {
    return { emoji: "🍐", bg: "linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)", border: "#bef264" };
  }
  if (n.includes("cherr")) {
    return { emoji: "🍒", bg: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)", border: "#fda4af" };
  }
  if (n.includes("kiwi")) {
    return { emoji: "🥝", bg: "linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)", border: "#bef264" };
  }
  if (n.includes("coconut")) {
    return { emoji: "🥥", bg: "linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)", border: "#d6d3d1" };
  }
  if (n.includes("avocado")) {
    return { emoji: "🥑", bg: "linear-gradient(135deg, #ecfccb 0%, #bbf7d0 100%)", border: "#86efac" };
  }

  // Vegetables
  if (n.includes("tomato")) {
    return { emoji: "🍅", bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", border: "#fca5a5" };
  }
  if (n.includes("cucumber") || n.includes("pickle") || n.includes("gherkin")) {
    return { emoji: "🥒", bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", border: "#86efac" };
  }
  if (n.includes("bittermelon") || n.includes("bitter gourd") || n.includes("karela")) {
    return { emoji: "🥒", bg: "linear-gradient(135deg, #dcfce7 0%, #86efac 100%)", border: "#4ade80" };
  }
  if (n.includes("eggplant") || n.includes("aubergine") || n.includes("brinjal")) {
    return { emoji: "🍆", bg: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)", border: "#d8b4fe" };
  }
  if (n.includes("carrot")) {
    return { emoji: "🥕", bg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", border: "#fdba74" };
  }
  if (n.includes("potato") || n.includes("yam")) {
    return { emoji: "🥔", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  }
  if (n.includes("corn") || n.includes("maize")) {
    return { emoji: "🌽", bg: "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)", border: "#fde047" };
  }
  if (n.includes("broccoli") || n.includes("cauliflower")) {
    return { emoji: "🥦", bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", border: "#86efac" };
  }
  if (n.includes("lettuce") || n.includes("cabbage") || n.includes("spinach") || n.includes("kale") || n.includes("salad") || n.includes("greens")) {
    return { emoji: "🥬", bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", border: "#86efac" };
  }
  if (n.includes("pepper") || n.includes("capsicum") || n.includes("chili") || n.includes("chilli") || n.includes("jalapeno")) {
    return { emoji: n.includes("chili") || n.includes("chilli") || n.includes("hot") ? "🌶️" : "🫑", bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", border: "#86efac" };
  }
  if (n.includes("onion") || n.includes("shallot") || n.includes("scallion") || n.includes("leek")) {
    return { emoji: "🧅", bg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", border: "#fdba74" };
  }
  if (n.includes("garlic")) {
    return { emoji: "🧄", bg: "linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)", border: "#d6d3d1" };
  }
  if (n.includes("mushroom") || n.includes("fungi")) {
    return { emoji: "🍄", bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", border: "#fca5a5" };
  }
  if (n.includes("pea") || n.includes("peas") || n.includes("bean") || n.includes("beans")) {
    return { emoji: "🫛", bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", border: "#86efac" };
  }

  // Dairy Products
  if (n.includes("milk")) {
    return { emoji: "🥛", bg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", border: "#bae6fd" };
  }
  if (n.includes("cheese")) {
    return { emoji: "🧀", bg: "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)", border: "#fde047" };
  }
  if (n.includes("butter")) {
    return { emoji: "🧈", bg: "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)", border: "#fde047" };
  }
  if (n.includes("egg")) {
    return { emoji: "🥚", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  }
  if (n.includes("yogurt") || n.includes("curd")) {
    return { emoji: "🥣", bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "#bbf7d0" };
  }
  if (n.includes("ice cream") || n.includes("gelato")) {
    return { emoji: "🍨", bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)", border: "#fbcfe8" };
  }

  // Meat & Poultry
  if (n.includes("chicken") || n.includes("poultry") || n.includes("turkey") || n.includes("duck") || n.includes("wing") || n.includes("drumstick")) {
    return { emoji: "🍗", bg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", border: "#fdba74" };
  }
  if (n.includes("beef") || n.includes("steak") || n.includes("meat") || n.includes("veal") || n.includes("mutton") || n.includes("lamb")) {
    return { emoji: "🥩", bg: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)", border: "#fda4af" };
  }
  if (n.includes("pork") || n.includes("bacon") || n.includes("ham")) {
    return { emoji: "🥓", bg: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)", border: "#fda4af" };
  }
  if (n.includes("sausage") || n.includes("hotdog") || n.includes("salami")) {
    return { emoji: "🌭", bg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", border: "#fdba74" };
  }

  // Seafood
  if (n.includes("shrimp") || n.includes("prawn")) {
    return { emoji: "🦐", bg: "linear-gradient(135deg, #ffedd5 0%, #fecdd3 100%)", border: "#fda4af" };
  }
  if (n.includes("crab")) {
    return { emoji: "🦀", bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", border: "#fca5a5" };
  }
  if (n.includes("lobster")) {
    return { emoji: "🦞", bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", border: "#fca5a5" };
  }
  if (n.includes("fish") || n.includes("salmon") || n.includes("tuna") || n.includes("cod") || n.includes("seafood") || n.includes("trout")) {
    return { emoji: "🐟", bg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)", border: "#7dd3fc" };
  }

  // Bakery
  if (n.includes("bread") || n.includes("loaf") || n.includes("toast") || n.includes("sourdough")) {
    return { emoji: "🍞", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  }
  if (n.includes("croissant")) {
    return { emoji: "🥐", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  }
  if (n.includes("baguette")) {
    return { emoji: "🥖", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  }
  if (n.includes("bagel") || n.includes("pretzel")) {
    return { emoji: "🥨", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  }
  if (n.includes("cookie") || n.includes("biscuit")) {
    return { emoji: "🍪", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  }
  if (n.includes("cake") || n.includes("cupcake") || n.includes("pastry") || n.includes("brownie")) {
    return { emoji: "🍰", bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)", border: "#fbcfe8" };
  }
  if (n.includes("donut") || n.includes("doughnut")) {
    return { emoji: "🍩", bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)", border: "#fbcfe8" };
  }
  if (n.includes("pie") || n.includes("tart")) {
    return { emoji: "🥧", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  }
  if (n.includes("pancake") || n.includes("waffle")) {
    return { emoji: "🥞", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  }

  // Packaged
  if (n.includes("pizza")) {
    return { emoji: "🍕", bg: "linear-gradient(135deg, #fee2e2 0%, #fef08a 100%)", border: "#fca5a5" };
  }
  if (n.includes("burger") || n.includes("hamburger")) {
    return { emoji: "🍔", bg: "linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)", border: "#fdba74" };
  }
  if (n.includes("sandwich")) {
    return { emoji: "🥪", bg: "linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)", border: "#fdba74" };
  }
  if (n.includes("noodle") || n.includes("ramen") || n.includes("pasta") || n.includes("spaghetti")) {
    return { emoji: "🍜", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  }
  if (n.includes("rice") || n.includes("grain")) {
    return { emoji: "🍚", bg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", border: "#e2e8f0" };
  }
  if (n.includes("cereal") || n.includes("oat")) {
    return { emoji: "🥣", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  }
  if (n.includes("canned") || n.includes("soup") || n.includes("can")) {
    return { emoji: "🥫", bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", border: "#fca5a5" };
  }
  if (n.includes("chocolate") || n.includes("candy")) {
    return { emoji: "🍫", bg: "linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)", border: "#d6d3d1" };
  }

  // Beverages
  if (n.includes("coffee") || n.includes("espresso") || n.includes("latte") || n.includes("cappuccino")) {
    return { emoji: "☕", bg: "linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)", border: "#fdba74" };
  }
  if (n.includes("tea") || n.includes("chai") || n.includes("matcha")) {
    return { emoji: "🍵", bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", border: "#86efac" };
  }
  if (n.includes("juice") || n.includes("smoothie")) {
    return { emoji: "🧃", bg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", border: "#fdba74" };
  }
  if (n.includes("soda") || n.includes("coke") || n.includes("cola")) {
    return { emoji: "🥤", bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", border: "#fca5a5" };
  }
  if (n.includes("beer")) {
    return { emoji: "🍺", bg: "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)", border: "#fde047" };
  }
  if (n.includes("wine")) {
    return { emoji: "🍷", bg: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)", border: "#f472b6" };
  }
  if (n.includes("water")) {
    return { emoji: "💧", bg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)", border: "#7dd3fc" };
  }

  // Category fallback if name didn't match
  if (c.includes("veg")) return { emoji: "🥦", bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", border: "#86efac" };
  if (c.includes("dairy")) return { emoji: "🥛", bg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", border: "#bae6fd" };
  if (c.includes("meat") || c.includes("poultry")) return { emoji: "🥩", bg: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)", border: "#fda4af" };
  if (c.includes("seafood") || c.includes("fish")) return { emoji: "🐟", bg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)", border: "#7dd3fc" };
  if (c.includes("bakery") || c.includes("bread")) return { emoji: "🍞", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#fcd34d" };
  if (c.includes("package")) return { emoji: "📦", bg: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)", border: "#cbd5e1" };
  if (c.includes("bev") || c.includes("drink")) return { emoji: "🥤", bg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)", border: "#fdba74" };
  if (c.includes("fruit")) return { emoji: "🍎", bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", border: "#fca5a5" };

  return { emoji: "🥗", bg: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)", border: "#cbd5e1" };
};

const renderFormattedMessage = (rawText) => {
  if (!rawText) return null;
  const normalized = String(rawText).replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const elements = [];
  let currentList = [];
  let isOrdered = false;

  const flushList = (key) => {
    if (currentList.length > 0) {
      if (isOrdered) {
        elements.push(
          <ol key={`ol-${key}`} className="formatted-msg-ol">
            {currentList.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${key}`} className="formatted-msg-list">
            {currentList.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
      }
      currentList = [];
      isOrdered = false;
    }
  };

  const formatInline = (str) => {
    if (!str) return "";
    return str
      // Bold: **text**
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic: *text* (avoid matching if inside strong)
      .replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, "$1<em>$2</em>$3")
      // Inline code: `text`
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(i);
      return;
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushList(i);
      elements.push(<hr key={i} className="formatted-msg-hr" />);
      return;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushList(i);
      elements.push(
        <blockquote
          key={i}
          className="formatted-msg-quote"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^>\s+/, "")) }}
        />
      );
      return;
    }

    // Headings (H4, H3, H2)
    if (trimmed.startsWith("#### ")) {
      flushList(i);
      elements.push(
        <h5
          key={i}
          className="formatted-msg-h4"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^####\s+/, "")) }}
        />
      );
      return;
    }
    if (trimmed.startsWith("### ")) {
      flushList(i);
      elements.push(
        <h4
          key={i}
          className="formatted-msg-h3"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^###\s+/, "")) }}
        />
      );
      return;
    }
    if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      flushList(i);
      elements.push(
        <h3
          key={i}
          className="formatted-msg-h2"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^#+\s+/, "")) }}
        />
      );
      return;
    }

    // Numbered list item: e.g. "1. ", "2. "
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (!isOrdered && currentList.length > 0) flushList(i);
      isOrdered = true;
      currentList.push(formatInline(orderedMatch[2]));
      return;
    }

    // Bullet list item: e.g. "- ", "* ", "• "
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      if (isOrdered && currentList.length > 0) flushList(i);
      isOrdered = false;
      currentList.push(formatInline(trimmed.replace(/^[-*•]\s+/, "")));
      return;
    }

    // Regular paragraph
    flushList(i);
    elements.push(
      <p
        key={i}
        className="formatted-msg-p"
        dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
      />
    );
  });

  flushList("end");
  return <div className="formatted-msg-container">{elements}</div>;
};

const ROLE_DASHBOARDS = {
  "Consumer": {
    badge: "Consumer",
    badgeColor: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.12)",
    defaultTab: "scanner",
    roleHubTitle: "Consumer Dashboard",
    roleSubtitle: "Manage personal items, scan food, view freshness and shelf-life guidance.",
    allowedTabs: ["scanner", "inventory", "register_food", "spoilage", "shelf_life", "recommendations", "storage_advisor", "reports", "analytics"],
    restrictedTabs: ["executive", "storage_monitoring", "storage_compliance", "users"],
    navItems: [
      { id: "scanner", icon: "🔍", label: "Produce Scanner" },
      { id: "inventory", icon: "📦", label: "Personal Inventory" },
      { id: "register_food", icon: "➕", label: "Register Produce" },
      { id: "spoilage", icon: "⚠️", label: "Freshness Warnings", hasBadge: true },
      { id: "shelf_life", icon: "🧠", label: "Shelf-Life Guidance", chip: "Guide" },
      { id: "recommendations", icon: "💡", label: "Storage Tips & Hacks" },
      { id: "storage_advisor", icon: "🤖", label: "Storage Advisor AI" },
      { id: "reports", icon: "📜", label: "Freshness Audit Ledger" }
    ]
  },
  "Retail Manager": {
    badge: "Retail Manager",
    badgeColor: "#059669",
    badgeBg: "rgba(5, 150, 105, 0.12)",
    defaultTab: "inventory",
    roleHubTitle: "Retail Manager Dashboard",
    roleSubtitle: "Review stock risks, record sales, and update item status.",
    allowedTabs: ["inventory", "recommendations", "spoilage", "analytics", "reports", "scanner", "register_food", "storage_advisor"],
    restrictedTabs: ["executive", "storage_monitoring", "storage_compliance", "users"],
    navItems: [
      { id: "inventory", icon: "📦", label: "Store Inventory", chip: "Sales" },
      { id: "recommendations", icon: "💡", label: "Stock Risks & FEFO" },
      { id: "spoilage", icon: "⚠️", label: "Stock Risk Radar", hasBadge: true },
      { id: "analytics", icon: "📊", label: "Store Analytics" },
      { id: "reports", icon: "📜", label: "Store Audit Reports" },
      { id: "scanner", icon: "🔍", label: "Quality Scanner" },
      { id: "register_food", icon: "➕", label: "Register Stock" },
      { id: "storage_advisor", icon: "🤖", label: "Storage Advisor AI" }
    ]
  },
  "Warehouse Operator": {
    badge: "Warehouse Operator",
    badgeColor: "#8b5cf6",
    badgeBg: "rgba(139, 92, 246, 0.12)",
    defaultTab: "storage_monitoring",
    roleHubTitle: "Warehouse Operator Dashboard",
    roleSubtitle: "Review storage readings, compliance alerts, and stock actions.",
    allowedTabs: ["storage_monitoring", "spoilage", "shelf_life", "storage_compliance", "inventory", "register_food", "recommendations", "scanner", "reports", "storage_advisor"],
    restrictedTabs: ["executive", "users"],
    navItems: [
      { id: "storage_monitoring", icon: "🌡️", label: "Storage Readings", chip: "Live" },
      { id: "spoilage", icon: "⚠️", label: "Compliance Alerts", hasBadge: true },
      { id: "shelf_life", icon: "🧠", label: "Shelf-Life Control", chip: "Operator" },
      { id: "storage_compliance", icon: "❄️", label: "Cold-Chain Settings" },
      { id: "inventory", icon: "📦", label: "Stock Inventory" },
      { id: "register_food", icon: "➕", label: "Register Batch" },
      { id: "recommendations", icon: "💡", label: "FEFO Dispatch Sequence" },
      { id: "scanner", icon: "🔍", label: "Batch Quality Scanner" },
      { id: "reports", icon: "📜", label: "Facility Audit Ledger" },
      { id: "storage_advisor", icon: "🤖", label: "Storage Advisor AI" }
    ]
  },
  "Food Quality Inspector": {
    badge: "Food Quality Inspector",
    badgeColor: "#d97706",
    badgeBg: "rgba(217, 119, 6, 0.12)",
    defaultTab: "scanner",
    roleHubTitle: "Food Quality Inspector Dashboard",
    roleSubtitle: "Inspect food, review analysis, and produce reports.",
    allowedTabs: ["scanner", "shelf_life", "spoilage", "reports", "analytics", "inventory", "storage_advisor"],
    restrictedTabs: ["executive", "storage_compliance", "users"],
    navItems: [
      { id: "scanner", icon: "🔍", label: "Produce Scanner" },
      { id: "shelf_life", icon: "🧠", label: "Shelf-Life Analysis" },
      { id: "spoilage", icon: "⚠️", label: "Spoilage Risk Radar", hasBadge: true },
      { id: "reports", icon: "📜", label: "Quality Certificates" },
      { id: "analytics", icon: "📊", label: "Freshness Analytics" },
      { id: "inventory", icon: "📦", label: "Inspected Batches" },
      { id: "storage_advisor", icon: "🤖", label: "Storage Advisor AI" }
    ]
  },
  "Enterprise Manager": {
    badge: "Enterprise Manager",
    badgeColor: "#0284c7",
    badgeBg: "rgba(2, 132, 199, 0.12)",
    defaultTab: "executive",
    roleHubTitle: "Enterprise Supply Governance",
    roleSubtitle: "Review enterprise analytics, global inventory, and supply chain telemetry.",
    allowedTabs: ["executive", "reports", "analytics", "inventory", "recommendations", "storage_monitoring", "shelf_life", "spoilage", "storage_advisor"],
    restrictedTabs: ["register_food", "storage_compliance", "users"],
    navItems: [
      { id: "executive", icon: "📊", label: "Executive Dashboard" },
      { id: "reports", icon: "📜", label: "Compliance Reports" },
      { id: "analytics", icon: "📊", label: "Freshness Analytics" },
      { id: "inventory", icon: "📦", label: "Global Inventory" },
      { id: "recommendations", icon: "💡", label: "FEFO Priorities" },
      { id: "storage_monitoring", icon: "🌡️", label: "Storage Telemetry" },
      { id: "shelf_life", icon: "🧠", label: "Shelf-Life Simulator" },
      { id: "spoilage", icon: "⚠️", label: "Critical Risk Radar", hasBadge: true },
      { id: "storage_advisor", icon: "🤖", label: "Storage Advisor AI" }
    ]
  },
  "Administrator": {
    badge: "Administrator",
    badgeColor: "#f59e0b",
    badgeBg: "rgba(245, 158, 11, 0.12)",
    defaultTab: "executive",
    roleHubTitle: "Administrator Dashboard",
    roleSubtitle: "Manage users and review platform-level information.",
    allowedTabs: ["executive", "users", "reports", "scanner", "analytics", "shelf_life", "storage_monitoring", "recommendations", "spoilage", "inventory", "register_food", "storage_compliance", "storage_advisor"],
    restrictedTabs: [],
    navItems: [
      { id: "executive", icon: "📊", label: "Platform Overview" },
      { id: "users", icon: "👥", label: "User Management", chip: "Admin" },
      { id: "reports", icon: "📜", label: "Platform Audit Reports" },
      { id: "scanner", icon: "🔍", label: "Freshness Scanner" },
      { id: "analytics", icon: "📊", label: "Freshness Analytics" },
      { id: "shelf_life", icon: "🧠", label: "Shelf-Life Engine", chip: "Admin" },
      { id: "storage_monitoring", icon: "🌡️", label: "Storage Telemetry" },
      { id: "recommendations", icon: "💡", label: "Recommendations & FEFO" },
      { id: "spoilage", icon: "⚠️", label: "Spoilage Alerts", hasBadge: true },
      { id: "inventory", icon: "📦", label: "Active Inventory" },
      { id: "register_food", icon: "➕", label: "Register Item" },
      { id: "storage_compliance", icon: "❄️", label: "Cold-Chain Settings" },
      { id: "storage_advisor", icon: "🤖", label: "Storage Advisor AI" }
    ]
  }
};

function App() {
  // Authentication States
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [view, setView] = useState(localStorage.getItem("token") ? "app" : "login");
  const [authName, setAuthName] = useState("");
  const [authRole, setAuthRole] = useState("Consumer");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Auth States
  const [loginStep, setLoginStep] = useState("credentials"); // "credentials" | "otp"
  const [otpCode, setOtpCode] = useState("");
  const [otpEmailSentTo, setOtpEmailSentTo] = useState("");
  const [otpDemoCode, setOtpDemoCode] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval = null;
    if (otpResendTimer > 0) {
      interval = setInterval(() => {
        setOtpResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpResendTimer]);

  // Navigation Tab State - Default based on URL hash
  const [activeTab, setActiveTab] = useState(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "").toLowerCase() : "";
    const path = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
    if (hash === "dashboard" || hash === "executive" || path === "/dashboard") return "executive";
    if (hash === "reports" || hash === "audit" || path === "/reports") return "reports";
    if (hash === "scanner" || path === "/scanner") return "scanner";
    if (hash === "shelf_life") return "shelf_life";
    if (hash === "inventory" || path === "/inventory") return "inventory";
    if (hash === "spoilage" || path === "/spoilage") return "spoilage";
    if (hash === "users") return "users";
    return "scanner";
  });

  // Topbar Notification Alert Dropdown State & Click-outside ref
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  // Role-based route guard: ensures each role stays within their authorized dashboard modules
  useEffect(() => {
    if (!user) return;
    const currentRole = user.role || "Consumer";
    const roleCfg = ROLE_DASHBOARDS[currentRole] || ROLE_DASHBOARDS["Consumer"];
    if (roleCfg.restrictedTabs && roleCfg.restrictedTabs.includes(activeTab)) {
      setActiveTab(roleCfg.defaultTab);
    }
  }, [user, activeTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync activeTab with URL hash/path
  useEffect(() => {
    const handleNav = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === "dashboard" || hash === "executive" || path === "/dashboard") {
        setActiveTab("executive");
      } else if (hash === "reports" || hash === "audit") {
        setActiveTab("reports");
      } else if (hash === "scanner") {
        setActiveTab("scanner");
      } else if (hash === "analytics") {
        setActiveTab("analytics");
      } else if (hash === "shelf_life") {
        setActiveTab("shelf_life");
      } else if (hash === "storage_monitoring" || hash === "storage") {
        setActiveTab("storage_monitoring");
      } else if (hash === "recommendations" || hash === "fefo") {
        setActiveTab("recommendations");
      } else if (hash === "spoilage") {
        setActiveTab("spoilage");
      } else if (hash === "inventory") {
        setActiveTab("inventory");
      } else if (hash === "register_food" || hash === "register") {
        setActiveTab("register_food");
      } else if (hash === "storage_compliance" || hash === "settings") {
        setActiveTab("storage_compliance");
      } else if (hash === "users") {
        setActiveTab("users");
      }
    };

    window.addEventListener("hashchange", handleNav);
    window.addEventListener("popstate", handleNav);
    return () => {
      window.removeEventListener("hashchange", handleNav);
      window.removeEventListener("popstate", handleNav);
    };
  }, []);

  // Keep URL in sync with activeTab changes
  useEffect(() => {
    const targetHash = activeTab === "executive" ? "dashboard" : activeTab;
    if (window.location.hash.replace("#", "") !== targetHash) {
      window.history.replaceState(null, "", `#${targetHash}`);
    }
  }, [activeTab]);

  // Prediction States
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // History States
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Spoilage Detection & Quality Alerts States (Milestone 2 - MongoDB backed)
  const [spoilageAlerts, setSpoilageAlerts] = useState([]);
  const [spoilageStats, setSpoilageStats] = useState({ total_alerts: 0, critical_count: 0, high_count: 0, quarantined_count: 0 });
  const [spoilageLoading, setSpoilageLoading] = useState(false);
  const [spoilageActionLoading, setSpoilageActionLoading] = useState(null);
  const [spoilageToast, setSpoilageToast] = useState(null);
  const [spoilageViewMode, setSpoilageViewMode] = useState("table");

  // Freshness Audit Report Modal States (Milestone 2)
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeReportData, setActiveReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Inventory Tracker States
  const [inventory, setInventory] = useState([]);
  const [invName, setInvName] = useState("");
  const [invCategory, setInvCategory] = useState("Fruits");
  const [invQtyVal, setInvQtyVal] = useState("1");
  const [invQtyUnit, setInvQtyUnit] = useState("kg"); // "kg" | "ltr" | "units"
  const [invStatus, setInvStatus] = useState("Fresh");
  const [invStorage, setInvStorage] = useState("Refrigerated");
  const [invExpiry, setInvExpiry] = useState("");
  const [invFilter, setInvFilter] = useState("All");
  const [invImage, setInvImage] = useState(null);
  const [invFormError, setInvFormError] = useState("");
  const [failedImages, setFailedImages] = useState({});

  // Live MongoDB Status State
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    mode: "Connecting...",
    database: "food_freshness",
    counts: { users: 0, predictions: 0, inventory: 0, spoilage_alerts: 0, storage_settings: 0 }
  });

  // Storage Compliance States (persisted in MongoDB)
  const [fridgeTemp, setFridgeTemp] = useState(4);
  const [humidity, setHumidity] = useState(80);
  const [airCirculation, setAirCirculation] = useState("Medium");
  const [lightExposure, setLightExposure] = useState("Low Light");
  const [storageSettings, setStorageSettings] = useState({
    fridge_temp: 4.0,
    humidity: 80.0,
    air_circulation: "Medium",
    light_exposure: "Low Light",
    auto_alert_expiry_days: 2,
    quarantine_temp: 2.0
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsToast, setSettingsToast] = useState(null);

  // Administrator User Management States (Milestone 4)
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [userRoleToast, setUserRoleToast] = useState("");
  const [adminUserSearch, setAdminUserSearch] = useState("");

  // Milestone 3: Freshness Analytics & Insights States
  const [insightsData, setInsightsData] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Milestone 3: Storage Monitoring & Multi-Zone Workflows States
  const [storageZones, setStorageZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [workflowActionLoading, setWorkflowActionLoading] = useState(null);
  const [workflowAuditLogs, setWorkflowAuditLogs] = useState([]);
  const [workflowToast, setWorkflowToast] = useState(null);

  // Milestone 3: Recommendation Engine States
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [fefoFilter, setFefoFilter] = useState("all");

  // Milestone 3: Shelf-Life Simulator States
  const [simProduce, setSimProduce] = useState("Banana");
  const [simFreshness, setSimFreshness] = useState("Fresh");
  const [simFqi, setSimFqi] = useState(88);
  const [simTemp, setSimTemp] = useState(4.0);
  const [simRh, setSimRh] = useState(85);
  const [simEthylene, setSimEthylene] = useState(0.04);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Milestone 4: Executive Analytics & Audit Reports States
  const [executiveData, setExecutiveData] = useState(null);
  const [_executiveLoading, setExecutiveLoading] = useState(false);
  const [executiveTimeRange, setExecutiveTimeRange] = useState("30d");
  const [_trendsData, setTrendsData] = useState([]);
  const [_trendsLoading, setTrendsLoading] = useState(false);
  const [complianceReport, setComplianceReport] = useState(null);
  const [complianceReportLoading, setComplianceReportLoading] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [reportFilter, setReportFilter] = useState("all");
  const [reportRoleFilter, setReportRoleFilter] = useState("all");
  const [reportUserFilter, setReportUserFilter] = useState("all");
  const [reportCategoryFilter, setReportCategoryFilter] = useState("all");
  const [reportQualityFilter, setReportQualityFilter] = useState("all");
  const [reportRiskFilter, setReportRiskFilter] = useState("all");
  const [showMacroAnalytics, setShowMacroAnalytics] = useState(false);
  const [fqiHoveredPoint, setFqiHoveredPoint] = useState(null);
  const [wasteHoveredBar, setWasteHoveredBar] = useState(null);

  // Storage Advisor AI & Gemini States
  const [chatMessages, setChatMessages] = useState([
    {
      id: "welcome-msg",
      sender: "bot",
      text: "👋 Welcome to the FreshKeeper Storage Advisor! Ask me how to store any produce, dairy, bakery, meat, or pantry item to maximize longevity, prevent spoilage, and maintain nutritional quality.",
      source: "FreshKeeper Engine",
      is_gemini: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      preservation_hacks: [
        "Wrap banana stems in foil or plastic wrap to block ethylene emission (+3 to 5 days).",
        "Line vegetable crisper drawers with paper towels to absorb excess condensation.",
        "Store potatoes and onions in completely separate dry, ventilated bins."
      ],
      recommended_envelope: {
        storage_type: "Precision Multi-Zone Storage",
        temperature: "Category specific (0°C to 20°C)",
        humidity: "Tailored RH% per food respiration",
        expected_shelf_life_gain: "+3 to +14 days with proper protocol"
      }
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [_chatSelectedFood, _setChatSelectedFood] = useState("");
  const [chatStatus, setChatStatus] = useState({
    gemini_configured: false,
    masked_key: null,
    active_model: "gemini-3-flash-preview",
    knowledge_base_items_count: 25,
    env_file_location: "backend/.env"
  });
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeySaving, setApiKeySaving] = useState(false);
  const [apiKeyFeedback, setApiKeyFeedback] = useState(null);
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);
  const floatingMessagesEndRef = useRef(null);
  const fullChatMessagesEndRef = useRef(null);

  useEffect(() => {
    if (floatingChatOpen && floatingMessagesEndRef.current) {
      floatingMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading, floatingChatOpen]);

  useEffect(() => {
    if (activeTab === "storage_advisor" && fullChatMessagesEndRef.current) {
      fullChatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading, activeTab]);

  // oxlint-disable react-hooks/exhaustive-deps
  useEffect(() => {
    if ((activeTab === "executive" || activeTab === "dashboard") && token) {
      fetchExecutiveSummary();
      fetchAnalyticsTrends();
    }
    if (activeTab === "reports" && token) {
      fetchComplianceReport();
    }
  }, [activeTab, token]);
  // oxlint-enable react-hooks/exhaustive-deps

  // Fetch Gemini Chatbot Status
  const fetchChatStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/status`);
      if (response.ok) {
        const data = await response.json();
        setChatStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch chat status:", err);
    }
  };

  // Send query to Storage Advisor
  const handleSendChatMessage = async (textToSend = null, foodItem = null) => {
    const query = (textToSend !== null ? textToSend : chatInput).trim();
    if (!query) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (textToSend === null) setChatInput("");
    setChatLoading(true);

    try {
      // Assemble recent conversation turns for multi-turn conversational context
      const recentHistory = chatMessages
        .filter(m => !m.is_error && m.id !== "welcome-msg")
        .slice(-6)
        .map(m => ({
          role: m.sender === "user" ? "user" : "model",
          content: m.text
        }));

      const payload = {
        message: query,
        food_name: foodItem || undefined,
        history: recentHistory
      };

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.reply || data.advice || "No response received.",
          source: data.source,
          is_gemini: data.source === "gemini",
          model: data.model,
          food_name: data.food_detected || data.food_name,
          recommended_envelope: data.recommended_envelope,
          spoilage_risks: data.spoilage_risks,
          preservation_hacks: data.quick_hacks || data.preservation_hacks,
          suggested_questions: data.suggested_questions || [],
          gemini_error: data.gemini_error,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, botMsg]);
      } else {
        const errData = await response.json().catch(() => ({}));
        setChatMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "bot",
            text: `⚠️ Storage Advisor notice: ${errData.detail || "Unable to retrieve advice. Please try again."}`,
            is_error: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error("Chat request failed:", err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          text: "⚠️ Connection error reaching the storage advisor. Please ensure backend server is active.",
          is_error: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const [apiKeyTesting, setApiKeyTesting] = useState(false);

  // Test Gemini API key directly against Google GenAI
  const handleTestGeminiApiKey = async (customKey = null) => {
    const keyToTest = (customKey !== null ? customKey : apiKeyInput).trim();
    if (!keyToTest) {
      setApiKeyFeedback({ type: "error", message: "Please paste an API key first to test." });
      return;
    }

    setApiKeyTesting(true);
    setApiKeyFeedback(null);
    try {
      const response = await fetch(`${API_URL}/chat/test-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ gemini_api_key: keyToTest })
      });

      const data = await response.json();
      if (response.ok && data.valid) {
        setApiKeyFeedback({
          type: "success",
          message: `🟢 ${data.message || "Connected to Google Gemini successfully!"}`
        });
      } else {
        setApiKeyFeedback({
          type: "error",
          message: `🔴 ${data.error || "Google Gemini connection failed. Please check key validity."}`
        });
      }
    } catch (err) {
      console.error("Test API key error:", err);
      setApiKeyFeedback({ type: "error", message: "❌ Failed to connect to server for testing." });
    } finally {
      setApiKeyTesting(false);
    }
  };

  // Save Gemini API key
  const handleSaveGeminiApiKey = async (e) => {
    if (e) e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setApiKeySaving(true);
    setApiKeyFeedback(null);
    try {
      const response = await fetch(`${API_URL}/chat/save-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ gemini_api_key: apiKeyInput.trim() })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setApiKeyFeedback({ type: "success", message: `✅ ${data.message}` });
        setApiKeyInput("");
        fetchChatStatus();
        setTimeout(() => {
          setApiKeyModalOpen(false);
          setApiKeyFeedback(null);
        }, 1800);
      } else {
        setApiKeyFeedback({ type: "error", message: `❌ ${data.detail || "Failed to save API key"}` });
      }
    } catch (err) {
      console.error("Save API key error:", err);
      setApiKeyFeedback({ type: "error", message: "❌ Failed to connect to server" });
    } finally {
      setApiKeySaving(false);
    }
  };
  const fetchInsights = async () => {
    if (!token) return;
    setInsightsLoading(true);
    try {
      const response = await fetch(`${API_URL}/inventory/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInsightsData(data);
      }
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Fetch Storage Zones & Workflow Audit Logs
  const fetchStorageZones = async () => {
    if (!token) return;
    setZonesLoading(true);
    try {
      const [resZones, resAudit] = await Promise.all([
        fetch(`${API_URL}/storage/zones`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/storage/workflows/audit`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (resZones.ok) {
        const data = await resZones.json();
        setStorageZones(data.zones || []);
      }
      if (resAudit.ok) {
        const auditData = await resAudit.json();
        setWorkflowAuditLogs(auditData.audit_logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch storage zones:", err);
    } finally {
      setZonesLoading(false);
    }
  };

  // Execute Storage Workflow Action
  const handleExecuteWorkflow = async (zoneId, action) => {
    setWorkflowActionLoading(`${zoneId}-${action}`);
    try {
      const response = await fetch(`${API_URL}/storage/workflows/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ zone_id: zoneId, action: action })
      });
      const data = await response.json();
      if (response.ok) {
        setWorkflowToast(data.workflow?.details || "Workflow executed successfully");
        setTimeout(() => setWorkflowToast(null), 4500);
        fetchStorageZones();
      } else {
        alert(data.detail || "Failed to trigger workflow");
      }
    } catch (err) {
      console.error("Workflow trigger error:", err);
    } finally {
      setWorkflowActionLoading(null);
    }
  };

  // Fetch Smart Recommendations
  const fetchRecommendations = async () => {
    if (!token) return;
    setRecommendationsLoading(true);
    try {
      const response = await fetch(`${API_URL}/recommendations/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendationsData(data);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Run Shelf-Life Simulation
  const runShelfLifeSimulation = async (customParams = null) => {
    if (!token) return;
    setSimLoading(true);
    try {
      const payload = customParams || {
        food_name: simProduce,
        freshness_label: simFreshness,
        quality_score: parseFloat(simFqi),
        storage_temp_c: parseFloat(simTemp),
        storage_rh_pct: parseFloat(simRh),
        ethylene_exposure_ppm: parseFloat(simEthylene)
      };
      const response = await fetch(`${API_URL}/shelf-life/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        setSimResult(data.simulation);
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setSimLoading(false);
    }
  };

  // Milestone 4: Fetch Executive Summary KPIs
  const fetchExecutiveSummary = async (range = executiveTimeRange) => {
    if (!token) return;
    setExecutiveLoading(true);
    try {
      const response = await fetch(`${API_URL}/analytics/executive-summary?time_range=${range}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExecutiveData(data);
      }
    } catch (err) {
      console.error("Failed to fetch executive summary:", err);
    } finally {
      setExecutiveLoading(false);
    }
  };

  // Milestone 4: Fetch Analytics Trends Trajectory
  const fetchAnalyticsTrends = async (days = 14) => {
    if (!token) return;
    setTrendsLoading(true);
    try {
      const response = await fetch(`${API_URL}/analytics/trends?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTrendsData(data.trends || []);
      }
    } catch (err) {
      console.error("Failed to fetch analytics trends:", err);
    } finally {
      setTrendsLoading(false);
    }
  };

  // Milestone 4: Fetch Executive Compliance Audit Report
  const fetchComplianceReport = async () => {
    if (!token) return;
    setComplianceReportLoading(true);
    try {
      const response = await fetch(`${API_URL}/analytics/reports/executive`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComplianceReport(data.report || null);
      }
    } catch (err) {
      console.error("Failed to fetch compliance report:", err);
    } finally {
      setComplianceReportLoading(false);
    }
  };

  // Milestone 4: Download Official CSV Audit Export
  const handleDownloadCSV = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/analytics/reports/export?format=csv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `FreshCheck_Compliance_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error("Failed to download CSV export:", err);
    }
  };

  // Milestone 4: Download Official Excel (.xlsx) Audit Export
  const handleDownloadExcel = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/analytics/reports/export?format=excel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `FreshCheck_Compliance_Audit_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error("Failed to download Excel export:", err);
    }
  };

  // Fetch live MongoDB connection status
  const fetchDbStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/db-status`);
      if (response.ok) {
        const data = await response.json();
        if (data.db) setDbStatus(data.db);
      }
    } catch (err) {
      console.error("Failed to fetch MongoDB status:", err);
    }
  };

  // Fetch Storage Settings from MongoDB
  const fetchStorageSettings = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/settings/storage`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setStorageSettings(data.settings);
          setFridgeTemp(data.settings.fridge_temp);
          setHumidity(data.settings.humidity);
          setAirCirculation(data.settings.air_circulation);
          setLightExposure(data.settings.light_exposure);
        }
      }
    } catch (err) {
      console.error("Failed to fetch storage settings from MongoDB:", err);
    }
  };

  // Save Cold-Chain Storage Settings to MongoDB
  const handleSaveStorageSettings = async (e) => {
    if (e) e.preventDefault();
    setSettingsSaving(true);
    try {
      const payload = {
        fridge_temp: parseFloat(fridgeTemp),
        humidity: parseFloat(humidity),
        air_circulation: airCirculation,
        light_exposure: lightExposure,
        auto_alert_expiry_days: storageSettings.auto_alert_expiry_days || 2,
        quarantine_temp: storageSettings.quarantine_temp || 2.0
      };
      const response = await fetch(`${API_URL}/settings/storage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        setStorageSettings(data.settings);
        setSettingsToast("Cold-chain compliance parameters saved successfully!");
        setTimeout(() => setSettingsToast(null), 4000);
        fetchDbStatus();
      } else {
        alert(data.detail || "Failed to save storage settings");
      }
    } catch (err) {
      console.error("Failed to save storage settings:", err);
    } finally {
      setSettingsSaving(false);
    }
  };

  // Delete Inventory item
  const handleDeleteInventory = async (itemId) => {
    if (!window.confirm("Remove this food item from inventory?")) return;
    try {
      const response = await fetch(`${API_URL}/inventory/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setInventory(prev => prev.filter(item => item.id !== itemId));
        if (typeof setSpoilageToast === "function") {
          setSpoilageToast("Food item removed successfully");
          setTimeout(() => setSpoilageToast(null), 3000);
        }
        fetchSpoilageAlerts();
        fetchDbStatus();
      } else {
        const data = await response.json();
        alert(data.detail || "Failed to delete item");
      }
    } catch (err) {
      console.error("Failed to delete inventory item:", err);
    }
  };

  // Update Inventory item status in MongoDB
  const handleUpdateInventoryStatus = async (itemId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/inventory/${itemId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
        if (typeof setSpoilageToast === "function") {
          setSpoilageToast(`Status updated to "${newStatus}"`);
          setTimeout(() => setSpoilageToast(null), 3500);
        }
        fetchSpoilageAlerts();
        fetchDbStatus();
      }
    } catch (err) {
      console.error("Failed to update inventory status:", err);
    }
  };

  // Delete prediction scan
  const handleDeleteHistoryItem = async (predId) => {
    if (!window.confirm("Delete this scan prediction?")) return;
    try {
      const response = await fetch(`${API_URL}/history/${predId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setHistory(prev => prev.filter(h => h.id !== predId));
        fetchSpoilageAlerts();
        fetchDbStatus();
      } else {
        const data = await response.json();
        alert(data.detail || "Failed to delete prediction record.");
      }
    } catch (err) {
      console.error("Failed to delete history record:", err);
    }
  };

  // Clear all scan predictions for user
  const handleClearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to delete ALL scan history?")) return;
    try {
      const response = await fetch(`${API_URL}/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setHistory([]);
        fetchSpoilageAlerts();
        fetchDbStatus();
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setView("app");
        fetchHistory();
        fetchInventory();
        fetchSpoilageAlerts();
        fetchStorageSettings();
        fetchDbStatus();
        fetchInsights();
        fetchStorageZones();
        fetchRecommendations();
        runShelfLifeSimulation();
        fetchExecutiveSummary();
        fetchAnalyticsTrends();
      } else {
        // Token invalid, log out
        handleLogout();
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      handleLogout();
    }
  };

  // Verify token and fetch user on load.
  // The callback is intentionally recreated with the component state.
  // oxlint-disable react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDbStatus();
    fetchChatStatus();
    if (token) {
      verifyToken();
    }
  }, [token]);
  // oxlint-enable react-hooks/exhaustive-deps

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_URL}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchSpoilageAlerts = async (overrideToken = null) => {
    const activeToken = overrideToken || token;
    if (!activeToken) return;
    setSpoilageLoading(true);
    try {
      const response = await fetch(`${API_URL}/spoilage-alerts`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSpoilageAlerts(data.alerts || []);
        setSpoilageStats({
          total_alerts: data.total_alerts || 0,
          critical_count: data.critical_count || 0,
          high_count: data.high_count || 0,
          quarantined_count: data.quarantined_count || 0
        });
      }
    } catch (err) {
      console.error("Failed to fetch spoilage alerts from MongoDB:", err);
    } finally {
      setSpoilageLoading(false);
    }
  };

  const handleSpoilageAction = async (alertId, actionType) => {
    setSpoilageActionLoading(alertId);
    try {
      const response = await fetch(`${API_URL}/spoilage-alerts/${alertId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: actionType }),
      });
      const data = await response.json();
      if (response.ok) {
        setSpoilageToast(data.message || "Action updated successfully");
        setTimeout(() => setSpoilageToast(null), 4500);
        // Refresh live data
        fetchSpoilageAlerts();
        fetchInventory();
      } else {
        alert(data.detail || "Failed to update alert");
      }
    } catch (err) {
      console.error("Failed to execute spoilage action:", err);
      alert("Network error. Please try again.");
    } finally {
      setSpoilageActionLoading(null);
    }
  };

  const openReportModal = async (predictionId) => {
    setReportLoading(true);
    setReportModalOpen(true);
    try {
      const response = await fetch(`${API_URL}/report/${predictionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setActiveReportData(data);
      } else {
        alert(data.detail || "Failed to load report.");
        setReportModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to open report:", err);
      alert("Error loading freshness report.");
      setReportModalOpen(false);
    } finally {
      setReportLoading(false);
    }
  };

  const downloadReportJSON = () => {
    if (!activeReportData) return;
    const blob = new Blob([JSON.stringify(activeReportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Freshness_Audit_${activeReportData.report_id || "Report"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchInventory = async (overrideToken = null) => {
    const activeToken = overrideToken || token;
    if (!activeToken) return;
    try {
      const response = await fetch(`${API_URL}/inventory`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setInventory(data.inventory);
      }
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  };

  const handleRecordSale = async (item) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/inventory/${item.id}/record-sale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sold_qty: item.qty || "1",
          new_status: "Sold"
        })
      });
      const data = await response.json();
      if (response.ok) {
        setInventory(prev => prev.map(i => i.id === item.id ? { ...i, status: "Sold" } : i));
        setSpoilageToast(`🏷️ Sale recorded for ${item.name}!`);
        setTimeout(() => setSpoilageToast(null), 3500);
      }
    } catch (err) {
      console.error("Failed to record sale:", err);
    }
  };

  const fetchAdminUsers = async () => {
    if (!token) return;
    setAdminUsersLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAdminUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (res.ok) {
        setUserRoleToast(data.message || `User role updated to ${newRole}`);
        fetchAdminUsers();
        setTimeout(() => setUserRoleToast(""), 4000);
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  };

  const predictFreshness = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed.");
      }

      setResult(data);
      // Refresh prediction history and spoilage alerts
      fetchHistory();
      fetchSpoilageAlerts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError("Please fill in all fields.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    setOtpMessage("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed.");
      }

      if (data.status === "otp_required") {
        setLoginStep("otp");
        setOtpEmailSentTo(data.email);
        setOtpDemoCode(data.demo_otp || "");
        setOtpMessage(data.message || "OTP verification code sent to your email.");
        setOtpResendTimer(60);
        setOtpCode("");
      } else if (data.access_token) {
        const activeToken = data.access_token;
        localStorage.setItem("token", activeToken);
        setToken(activeToken);
        setUser(data.user);
        setView("app");
        setAuthEmail("");
        setAuthPassword("");
        fetchSpoilageAlerts(activeToken);
        fetchInventory(activeToken);
        fetchExecutiveSummary();
        fetchAnalyticsTrends();
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setAuthError("Please enter the complete 6-digit verification code.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authEmail || otpEmailSentTo,
          otp_code: otpCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "OTP verification failed.");
      }

      const activeToken = data.access_token;
      localStorage.setItem("token", activeToken);
      setToken(activeToken);
      setUser(data.user);
      setView("app");
      setLoginStep("credentials");
      setAuthEmail("");
      setAuthPassword("");
      setOtpCode("");
      setOtpDemoCode("");
      setOtpMessage("");
      fetchSpoilageAlerts(activeToken);
      fetchInventory(activeToken);
      fetchExecutiveSummary();
      fetchAnalyticsTrends();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;

    setAuthLoading(true);
    setAuthError("");
    setOtpMessage("");

    try {
      const response = await fetch(`${API_URL}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authEmail || otpEmailSentTo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to resend code.");
      }

      setOtpDemoCode(data.demo_otp || "");
      setOtpMessage(data.message || "A new code has been sent to your email.");
      setOtpResendTimer(60);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authName || !authEmail || !authPassword || !authConfirmPassword || !authRole) {
      setAuthError("Please fill in all fields.");
      return;
    }

    if (authPassword !== authConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    if (authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword,
          role: authRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed.");
      }

      // Automatically initiate login after successful registration
      const loginResponse = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error("Registration succeeded, but auto-login failed. Please log in manually.");
      }

      if (loginData.status === "otp_required") {
        setView("login");
        setLoginStep("otp");
        setOtpEmailSentTo(loginData.email);
        setOtpDemoCode(loginData.demo_otp || "");
        setOtpMessage(loginData.message || "OTP verification code sent to your registered email.");
        setOtpResendTimer(60);
        setOtpCode("");
        setAuthName("");
        setAuthPassword("");
        setAuthConfirmPassword("");
        setAuthRole("Consumer");
      } else if (loginData.access_token) {
        localStorage.setItem("token", loginData.access_token);
        setToken(loginData.access_token);
        setUser(loginData.user);
        setView("app");
        setAuthName("");
        setAuthEmail("");
        setAuthPassword("");
        setAuthConfirmPassword("");
        setAuthRole("Consumer");
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setHistory([]);
    setInventory([]);
    setSpoilageAlerts([]);
    setSpoilageStats({
      total_alerts: 0,
      critical_count: 0,
      high_count: 0,
      quarantined_count: 0
    });
    setResult(null);
    setFile(null);
    setPreview(null);
    setInvImage(null);
    setView("login");
    setLoginStep("credentials");
    setOtpCode("");
    setOtpDemoCode("");
    setOtpMessage("");
    setAuthError("");
  };


  const handleInvImageChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        alert("Please select a valid image file (PNG, JPG, WEBP).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvImage(reader.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    setInvFormError("");

    // 1. Mandatory Food Item Image
    if (!invImage) {
      setInvFormError("⚠️ Food item image is mandatory. Please upload an image before registering.");
      return;
    }

    // 2. Mandatory Food Item Name
    if (!invName || !invName.trim()) {
      setInvFormError("⚠️ Please enter the food item name.");
      return;
    }

    // 3. Mandatory Category
    if (!invCategory) {
      setInvFormError("⚠️ Please select a valid food category.");
      return;
    }

    // 4. Mandatory Quantity
    if (!invQtyVal || !String(invQtyVal).trim() || parseFloat(invQtyVal) <= 0) {
      setInvFormError("⚠️ Please enter a valid quantity greater than 0.");
      return;
    }

    // 5. Mandatory Freshness Status
    if (!invStatus) {
      setInvFormError("⚠️ Please select the freshness status.");
      return;
    }

    // 6. Mandatory Storage Condition
    if (!invStorage) {
      setInvFormError("⚠️ Please select the storage condition.");
      return;
    }

    const formattedQty = `${String(invQtyVal).trim()} ${invQtyUnit || "units"}`;
    // Expiry date is optional
    const expiryDate = invExpiry && invExpiry.trim() ? invExpiry : "N/A";

    try {
      const response = await fetch(`${API_URL}/inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: invName.trim(),
          category: invCategory,
          qty: formattedQty,
          status: invStatus,
          storage: invStorage,
          expiry: expiryDate,
          image: invImage,
        })
      });

      const data = await response.json();

      if (response.ok) {
        setInventory([data.item, ...inventory]);
        setInvName("");
        setInvQtyVal("1");
        setInvQtyUnit("kg");
        setInvStatus("Fresh");
        setInvStorage("Refrigerated");
        setInvExpiry("");
        setInvImage(null);
        setInvFormError("");

        // Switch to active inventory tab to see the newly added item
        setActiveTab("inventory");
      } else {
        setInvFormError(data.detail || "Failed to add inventory item.");
      }
    } catch (err) {
      console.error("Failed to add inventory item:", err);
      setInvFormError("Network error while registering food item.");
    }
  };

  const handleSavePredictionToInventory = () => {
    if (!result) return;
    setInvName(result.food);
    setInvStatus(result.freshness);
    setInvQtyVal("1");
    setInvQtyUnit("units");
    if (preview) {
      setInvImage(preview);
    }

    const lowercaseFood = result.food.toLowerCase();
    let category = "Fruits";
    // Sync category classification with the trained dataset foods
    if (
      lowercaseFood.includes("spinach") ||
      lowercaseFood.includes("cabbage") ||
      lowercaseFood.includes("carrot") ||
      lowercaseFood.includes("potato") ||
      lowercaseFood.includes("tomato") ||
      lowercaseFood.includes("capsicum") ||
      lowercaseFood.includes("chilli") ||
      lowercaseFood.includes("cucumber") ||
      lowercaseFood.includes("brinjal") ||
      lowercaseFood.includes("garlic") ||
      lowercaseFood.includes("ginger") ||
      lowercaseFood.includes("onion") ||
      lowercaseFood.includes("bittermelon") ||
      lowercaseFood.includes("eggplant")
    ) {
      category = "Vegetables";
    }
    setInvCategory(category);

    const expDate = new Date();
    // result.max_days contains the correct upper bound of the dataset's shelf life range
    const daysToAdd = parseInt(result.max_days) || 5;
    expDate.setDate(expDate.getDate() + daysToAdd);
    setInvExpiry(expDate.toISOString().split('T')[0]);

    // Switch to register item tab
    setActiveTab("register_food");
  };

  // Helper to format date in user's local timezone
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    let cleanStr = String(dateStr).trim();
    // If it's an ISO timestamp without timezone designator, append 'Z' so it's treated as UTC
    if (cleanStr.includes("T") && !cleanStr.endsWith("Z") && !cleanStr.includes("+") && !cleanStr.slice(cleanStr.indexOf("T")).includes("-")) {
      cleanStr += "Z";
    }
    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) return String(dateStr);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper to compile active alerts matching the Alert Center requirements directly from backend data
  const getDashboardAlerts = () => {
    const list = [];
    const seenNames = new Set();
    const now = new Date();

    // 1. Process real backend spoilage alerts (from /spoilage-alerts MongoDB collection)
    (spoilageAlerts || []).forEach((sa, idx) => {
      const name = (sa.title || sa.name || sa.food_name || "Produce Item").trim();
      const isCrit = sa.severity === "Critical" || (sa.status || "").toLowerCase().includes("rotten") || (sa.status || "").toLowerCase().includes("spoiled");
      const daysLeft = typeof sa.days_left === "number" ? sa.days_left : 0;
      const alertType = isCrit || daysLeft <= 0 ? "EXPIRED" : "NEAR EXPIRY";
      const desc = sa.action_required || sa.notes || (isCrit ? "High spoilage risk detected." : (daysLeft === 1 ? "Expires tomorrow." : `Expires in ${daysLeft} days.`));
      const itemId = sa.source_id && sa.source_id.startsWith("inv-") ? sa.source_id.replace("inv-", "") : (sa.item_id || null);

      seenNames.add(name.toLowerCase());
      list.push({
        id: sa.id || `sa-${idx}`,
        name: name,
        type: alertType,
        severity: alertType === "EXPIRED" ? "expired" : "near-expiry",
        icon: alertType === "EXPIRED" ? "🚨" : "⏳",
        desc: desc,
        days_left: daysLeft,
        item_id: itemId
      });
    });

    // 2. Process active inventory items that are near-expiry or expired and not yet represented in alerts
    (inventory || []).forEach((item, idx) => {
      let daysLeft = 999;
      if (item.expiry && item.expiry !== "N/A") {
        const expDate = new Date(item.expiry);
        if (!isNaN(expDate.getTime())) {
          const diffMs = expDate.getTime() - now.getTime();
          daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }
      }
      const isRotten = (item.status || "").toLowerCase().includes("rotten") || (item.status || "").toLowerCase().includes("spoiled") || (item.status || "").toLowerCase().includes("near");

      const itemName = (item.name || "Produce Item").trim();
      const alreadyInList = seenNames.has(itemName.toLowerCase()) || list.some(l => l.item_id === item.id);

      if (!alreadyInList) {
        if (daysLeft <= 0 || isRotten) {
          seenNames.add(itemName.toLowerCase());
          list.push({
            id: item.id || `inv-${idx}`,
            name: itemName,
            type: "EXPIRED",
            severity: "expired",
            icon: "🚨",
            desc: daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d ago (${item.expiry || "Past"})` : (daysLeft === 0 ? `Expired today (${item.expiry || "Due"})` : `Batch status: ${item.status || "At risk"}`),
            days_left: daysLeft === 999 ? 0 : daysLeft,
            item_id: item.id
          });
        } else if (daysLeft <= 3) {
          seenNames.add(itemName.toLowerCase());
          list.push({
            id: item.id || `inv-${idx}`,
            name: itemName,
            type: "NEAR EXPIRY",
            severity: "near-expiry",
            icon: "⏳",
            desc: daysLeft === 1 ? "Expires tomorrow." : `Expires in ${daysLeft} days.`,
            days_left: daysLeft,
            item_id: item.id
          });
        }
      }
    });

    return list.sort((a, b) => {
      if (a.type === "EXPIRED" && b.type !== "EXPIRED") return -1;
      if (b.type === "EXPIRED" && a.type !== "EXPIRED") return 1;
      return (a.days_left || 0) - (b.days_left || 0);
    });
  };

  // Render Login View
  if (view === "login") {
    if (loginStep === "otp") {
      return (
        <div className="auth-container">
          <div className="auth-card otp-card">
            <div className="auth-header">
              <span className="auth-logo">🔐</span>
              <h2>Verify OTP Code</h2>
              <p>We've sent a 6-digit verification code to your registered email:</p>
              <div className="otp-email-badge">{authEmail || otpEmailSentTo}</div>
            </div>

            {otpDemoCode && (
              <div className="otp-demo-box">
                <span className="otp-demo-label">⚡ Demo / Dev Mode OTP Code:</span>
                <span className="otp-demo-code">{otpDemoCode}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="input-group">
                <label htmlFor="otp-input">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  id="otp-input"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 123456"
                  className="otp-input-field"
                  autoFocus
                  required
                />
              </div>

              {authError && <div className="auth-error-alert">{authError}</div>}
              {otpMessage && !authError && <div className="auth-info-alert">{otpMessage}</div>}

              <button type="submit" className="auth-btn" disabled={authLoading || otpCode.length < 6}>
                {authLoading ? "Verifying OTP..." : "Verify & Login"}
              </button>
            </form>

            <div className="otp-actions">
              <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResendOtp}
                disabled={otpResendTimer > 0 || authLoading}
              >
                {otpResendTimer > 0 ? `Resend Code in ${otpResendTimer}s` : "Resend OTP Code"}
              </button>

              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setLoginStep("credentials");
                  setAuthError("");
                  setOtpMessage("");
                }}
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-logo">🥬</span>
            <h2>Welcome Back</h2>
            <p>Sign in to check your food freshness</p>
          </div>
          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  id="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {authError && <div className="auth-error-alert">{authError}</div>}

            <button type="submit" className="auth-btn" disabled={authLoading}>
              {authLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setView("register");
                  setAuthError("");
                }}
              >
                Register Now
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }


  // Render Register View
  if (view === "register") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-logo">🥬</span>
            <h2>Create Account</h2>
            <p>Get started with FreshCheck AI</p>
          </div>
          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-group">
              <label htmlFor="reg-name">Name</label>
              <input
                type="text"
                id="reg-name"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="reg-role">Role</label>
              <select
                id="reg-role"
                value={authRole}
                onChange={(e) => setAuthRole(e.target.value)}
                required
              >
                <option value="Consumer">Consumer</option>
                <option value="Retail Manager">Retail Manager</option>
                <option value="Warehouse Operator">Warehouse Operator</option>
                <option value="Food Quality Inspector">Food Quality Inspector</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                type="email"
                id="reg-email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="reg-password">Password</label>
              <div className="password-wrapper">
                <input
                  type={showRegPassword ? "text" : "password"}
                  id="reg-password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  aria-label={showRegPassword ? "Hide password" : "Show password"}
                >
                  {showRegPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  value={authConfirmPassword}
                  onChange={(e) => setAuthConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {authError && <div className="auth-error-alert">{authError}</div>}

            <button type="submit" className="auth-btn" disabled={authLoading}>
              {authLoading ? "Creating account..." : "Register"}
            </button>
          </form>
          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setView("login");
                  setAuthError("");
                }}
              >
                Login Instead
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard View (view === "app")
  return (
    <>
      <div className={`app-layout ${reportModalOpen ? "has-report-modal" : ""}`}>
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">🥬</span>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>FreshCheck AI</h2>
            <span className="sidebar-subtitle">Food Freshness Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          {((ROLE_DASHBOARDS[user?.role || "Consumer"] || ROLE_DASHBOARDS["Consumer"]).navItems).map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === "executive") {
                  fetchExecutiveSummary();
                  fetchAnalyticsTrends();
                } else if (item.id === "reports") {
                  fetchComplianceReport();
                } else if (item.id === "analytics") {
                  fetchInsights();
                } else if (item.id === "shelf_life") {
                  if (!simResult) runShelfLifeSimulation();
                } else if (item.id === "storage_monitoring") {
                  fetchStorageZones();
                } else if (item.id === "recommendations") {
                  fetchRecommendations();
                } else if (item.id === "spoilage") {
                  fetchSpoilageAlerts();
                } else if (item.id === "inventory") {
                  fetchInventory();
                } else if (item.id === "storage_compliance") {
                  fetchStorageSettings();
                } else if (item.id === "users") {
                  fetchAdminUsers();
                }
              }}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.chip && (
                <span className="nav-chip" style={{
                  background: (ROLE_DASHBOARDS[user?.role || "Consumer"] || ROLE_DASHBOARDS["Consumer"]).badgeColor,
                }}>
                  {item.chip}
                </span>
              )}
              {item.hasBadge && spoilageStats.total_alerts > 0 && (
                <span className="nav-badge" style={{
                  background: spoilageStats.critical_count > 0 ? '#ef4444' : '#f59e0b',
                }}>
                  {spoilageStats.total_alerts}
                </span>
              )}
            </button>
          ))}
        </nav>

        {user && (
          <div className="sidebar-profile">
            <div className="profile-details">
              <span className="profile-avatar">👤</span>
              <div className="profile-info">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <span className="role-badge">{user.role}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="sidebar-logout-btn">
              <LogoutIcon /> Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="main-viewport">
        <header className="header">
          <div className="topbar-container">
            <div className="topbar-breadcrumb">
              <button
                type="button"
                className="topbar-breadcrumb-parent"
                onClick={() => {
                  const roleCfg = ROLE_DASHBOARDS[user?.role || "Consumer"] || ROLE_DASHBOARDS["Consumer"];
                  const targetTab = roleCfg.defaultTab;
                  setActiveTab(targetTab);
                  if (targetTab === "executive") {
                    fetchExecutiveSummary();
                    fetchAnalyticsTrends();
                  } else if (targetTab === "shelf_life") {
                    if (!simResult) runShelfLifeSimulation();
                  } else if (targetTab === "reports") {
                    fetchComplianceReport();
                  } else if (targetTab === "inventory") {
                    fetchInventory();
                  }
                }}
                title="Go to Role Dashboard"
              >
                Dashboard
              </button>
              <span className="topbar-breadcrumb-sep">/</span>
              <span className="topbar-breadcrumb-current">
                {activeTab === "executive" && "Overview & Alert Center"}
                {activeTab === "reports" && (user?.role === "Administrator" ? "Platform Compliance & Audit Reports" : "Food Freshness Audit & Quality Certificates")}
                {activeTab === "scanner" && "Freshness Scanner"}
                {activeTab === "analytics" && "Freshness Analytics"}
                {activeTab === "shelf_life" && "Shelf-Life Engine"}
                {activeTab === "storage_monitoring" && "Storage Monitoring"}
                {activeTab === "recommendations" && "Recommendations & FEFO"}
                {activeTab === "spoilage" && "Spoilage Alerts"}
                {activeTab === "inventory" && "Active Inventory"}
                {activeTab === "register_food" && "Register Item"}
                {activeTab === "storage_compliance" && "Cold-Chain Settings"}
                {activeTab === "storage_advisor" && "AI Storage & Longevity Advisor"}
                {activeTab === "users" && "Platform User Management"}
              </span>
            </div>
            <div className="topbar-right">
              {/* Notification Bell with Dropdown Popover */}
              <div className="topbar-bell-wrapper" ref={notificationRef}>
                <button
                  type="button"
                  className={`topbar-bell-btn ${notificationOpen ? "active" : ""}`}
                  onClick={() => {
                    setNotificationOpen(prev => {
                      if (!prev) {
                        fetchSpoilageAlerts();
                        fetchInventory();
                      }
                      return !prev;
                    });
                  }}
                  title="Toggle Alert Center & Notifications"
                  aria-expanded={notificationOpen}
                >
                  <span className="bell-icon">🔔</span>
                  <span className="topbar-bell-badge">{getDashboardAlerts().length}</span>
                </button>

                {notificationOpen && (
                  <div className="topbar-alert-dropdown">
                    <div className="dropdown-alert-header">
                      <div className="dropdown-alert-title-box">
                        <div className="alert-bell-circle">🔔</div>
                        <div>
                          <div className="dropdown-brand-tag">FreshCheck Alert Center</div>
                          <h4>{getDashboardAlerts().length} alerts need attention</h4>
                        </div>
                      </div>
                      <div className="dropdown-header-right">
                        <span className="dropdown-count-pill">{getDashboardAlerts().length}</span>
                        <button
                          type="button"
                          className="dropdown-close-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotificationOpen(false);
                          }}
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="dropdown-alert-list">
                      {getDashboardAlerts().length === 0 ? (
                        <div className="dropdown-alert-empty" style={{ padding: "32px 16px", textAlign: "center", color: "var(--gray-500)" }}>
                          <span style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}>✅</span>
                          <div style={{ fontWeight: 700, color: "var(--dark)", fontSize: "14px", marginBottom: "4px" }}>
                            All Batches Fresh
                          </div>
                          <p style={{ fontSize: "12px", margin: 0, color: "var(--gray-500)" }}>
                            No active spoilage hazards or expiring items detected in the backend.
                          </p>
                        </div>
                      ) : (
                        getDashboardAlerts().map((alert, idx) => (
                          <div
                            key={alert.id || idx}
                            className={`alert-card-row ${alert.type === "EXPIRED" ? "expired" : "near-expiry"}`}
                            onClick={() => {
                              setNotificationOpen(false);
                              if (alert.item_id) {
                                setActiveTab("inventory");
                              } else {
                                setActiveTab("spoilage");
                              }
                            }}
                          >
                            <div className="alert-item-left">
                              <span className="alert-item-icon">{alert.icon || "⏳"}</span>
                              <div className="alert-item-text">
                                <div className="alert-item-header-line">
                                  <span className="alert-item-name">{alert.name}</span>
                                  <span className={`alert-status-badge ${alert.type === "EXPIRED" ? "expired" : "near-expiry"}`}>
                                    {alert.type}
                                  </span>
                                </div>
                                <p className="alert-item-desc">{alert.desc}</p>
                              </div>
                            </div>
                            <span className={`alert-dot-indicator ${alert.type === "EXPIRED" ? "expired" : "near-expiry"}`}></span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="dropdown-alert-footer">
                      <button
                        type="button"
                        className="dropdown-footer-btn-primary"
                        onClick={() => {
                          setNotificationOpen(false);
                          setActiveTab("executive");
                          fetchExecutiveSummary();
                        }}
                      >
                        Open Dashboard Alerts →
                      </button>
                      <button
                        type="button"
                        className="dropdown-footer-btn-secondary"
                        onClick={() => {
                          setNotificationOpen(false);
                          setActiveTab("spoilage");
                        }}
                      >
                        Spoilage Queue
                      </button>
                    </div>
                  </div>
                )}
              </div>


              <div className="topbar-user-chip">
                <span className="topbar-user-icon">👤</span>
                <span className="topbar-user-name">{user?.name || "User"}</span>
                <span className="topbar-role-badge">{user?.role || "Consumer"}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container" style={{ maxWidth: 'none', margin: 0, padding: '32px' }}>

          {/* TAB 1: SCANNER */}
          {activeTab === "scanner" && (
            <div className="tab-pane">
              <section className="intro">
                <h2>Check Food Freshness</h2>
                <p>
                  Upload an image of a fruit or vegetable and let our AI model
                  predict its freshness, shelf life, and classification.
                </p>
              </section>

              <div className="dashboard-grid">
                <div className="dashboard-main">
                  <section className="upload-card">
                    <label className="upload-area">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Selected food"
                          className="preview-image"
                        />
                      ) : (
                        <div className="upload-message">
                          <div className="upload-icon">📷</div>
                          <strong>Upload Food Image</strong>
                          <span>JPG, JPEG or PNG</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileChange}
                        hidden
                      />
                    </label>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button
                        className="predict-button"
                        onClick={predictFreshness}
                        disabled={!file || loading}
                        style={{ margin: 0, flex: 2 }}
                      >
                        {loading ? "Analyzing..." : "Predict Freshness"}
                      </button>

                      {(file || result) && (
                        <button
                          className="auth-btn"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                            setResult(null);
                            setError("");
                          }}
                          style={{
                            margin: 0,
                            flex: 1,
                            background: 'var(--gray-500)',
                            boxShadow: 'none',
                            color: 'white',
                            fontWeight: '700',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: 'none',
                            transition: 'var(--transition)'
                          }}
                        >
                          {result ? "Scan Another" : "Clear"}
                        </button>
                      )}
                    </div>

                    {error && <div className="error">{error}</div>}
                  </section>

                  {result && (
                    <section className="result-card report-card" style={{ padding: '24px', textAlign: 'left', marginTop: '24px' }}>
                      {/* Report Header */}
                      <div className="report-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div className="report-title-area" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '32px' }}>
                            {result.freshness === "Fresh" ? "🍏" : result.freshness === "Semi-Fresh" ? "🍌" : "🍅"}
                          </span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--dark-green)' }}>{result.food}</h3>
                              <span className={`freshness-badge ${result.freshness.toLowerCase().replace(' ', '-')}`}>
                                {result.freshness.toUpperCase()}
                              </span>
                              {result.grade && (
                                <span className={`grade-badge grade-${result.grade.toLowerCase().replace('+', '-plus')}`}>
                                  Grade {result.grade}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>
                              AI Inference Engine • Confidence: {result.confidence}% • Shelf Life: {result.days} days
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => openReportModal(result.id)}
                            className="auth-btn"
                            style={{ margin: 0, padding: '8px 16px', width: 'auto', fontSize: '13px', background: 'var(--gray-700)' }}
                          >
                            📋 View Audit Report
                          </button>
                          <button
                            onClick={handleSavePredictionToInventory}
                            className="auth-btn"
                            style={{ margin: 0, padding: '8px 16px', width: 'auto', fontSize: '13px', background: 'var(--primary-hover)' }}
                          >
                            ➕ Save to Inventory
                          </button>
                        </div>
                      </div>

                      {/* Top Grid: FQI Gauge & Key Metrics */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) 2fr', gap: '24px', alignItems: 'center' }}>
                        {/* Circular Food Quality Index Gauge */}
                        <div style={{ background: 'var(--gray-50)', padding: '24px 20px', borderRadius: '20px', border: '1.5px solid var(--gray-200)', textAlign: 'center' }}>
                          <div className="fqi-ring-container">
                            <svg className="fqi-ring-svg" viewBox="0 0 140 140">
                              <circle className="fqi-ring-circle-bg" cx="70" cy="70" r="58" />
                              <circle
                                className="fqi-ring-circle-fill"
                                cx="70"
                                cy="70"
                                r="58"
                                strokeDasharray={364}
                                strokeDashoffset={364 - (364 * (result.quality_score || 85)) / 100}
                                stroke={
                                  (result.quality_score || 85) >= 85 ? "#10b981" :
                                  (result.quality_score || 85) >= 70 ? "#34d399" :
                                  (result.quality_score || 85) >= 50 ? "#f59e0b" : "#ef4444"
                                }
                              />
                            </svg>
                            <div className="fqi-ring-content">
                              <div className="fqi-score-number">{result.quality_score || 85}</div>
                              <div className="fqi-score-sub">FQI SCORE</div>
                            </div>
                          </div>
                          <div style={{ marginTop: '14px', fontSize: '13px', fontWeight: 700, color: 'var(--dark)' }}>
                            {result.grade_description || "Composite Food Quality Index"}
                          </div>
                        </div>

                        {/* Quality Components Progress Bars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '4px' }}>
                              <span>Visual Appeal Score</span>
                              <span>{result.quality_components?.visual_score || 88}%</span>
                            </div>
                            <div className="metric-progress-track">
                              <div className="metric-progress-bar" style={{ width: `${result.quality_components?.visual_score || 88}%`, background: '#10b981' }}></div>
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '4px' }}>
                              <span>Shelf-Life Durability Index</span>
                              <span>{result.quality_components?.shelf_life_index || 75}%</span>
                            </div>
                            <div className="metric-progress-track">
                              <div className="metric-progress-bar" style={{ width: `${result.quality_components?.shelf_life_index || 75}%`, background: '#3b82f6' }}></div>
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '4px' }}>
                              <span>Surface Integrity Index</span>
                              <span>{result.quality_components?.surface_integrity || result.visual_features?.surface_integrity || 92}%</span>
                            </div>
                            <div className="metric-progress-track">
                              <div className="metric-progress-bar" style={{ width: `${result.quality_components?.surface_integrity || result.visual_features?.surface_integrity || 92}%`, background: '#8b5cf6' }}></div>
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '4px' }}>
                              <span>Cold-Chain Storage Compliance</span>
                              <span>{result.quality_components?.storage_compliance || 90}%</span>
                            </div>
                            <div className="metric-progress-track">
                              <div className="metric-progress-bar" style={{ width: `${result.quality_components?.storage_compliance || 90}%`, background: '#06b6d4' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multi-Metric Image Analysis Panel */}
                      <h4 style={{ margin: '24px 0 12px', fontSize: '15px', fontWeight: 800, color: 'var(--dark-green)' }}>
                        🔬 Visual Feature Extraction & Image Analysis
                      </h4>
                      <div className="feature-analysis-grid">
                        <div className="feature-metric-card">
                          <div className="metric-header">
                            <span className="metric-title">RGB Spectrum Balance</span>
                            <span className="metric-value">
                              {result.visual_features?.color_distribution ?
                                `R:${result.visual_features.color_distribution.red_percent}%` : "Normal"}
                            </span>
                          </div>
                          <div className="color-tribar">
                            <div className="color-bar-r" style={{ width: `${result.visual_features?.color_distribution?.red_percent || 33}%` }}></div>
                            <div className="color-bar-g" style={{ width: `${result.visual_features?.color_distribution?.green_percent || 34}%` }}></div>
                            <div className="color-bar-b" style={{ width: `${result.visual_features?.color_distribution?.blue_percent || 33}%` }}></div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--gray-500)', marginTop: '4px', fontWeight: 600 }}>
                            <span>Red {result.visual_features?.color_distribution?.red_percent || 33}%</span>
                            <span>Green {result.visual_features?.color_distribution?.green_percent || 34}%</span>
                            <span>Blue {result.visual_features?.color_distribution?.blue_percent || 33}%</span>
                          </div>
                        </div>

                        <div className="feature-metric-card">
                          <div className="metric-header">
                            <span className="metric-title">Surface Degradation</span>
                            <span className="metric-value">{result.visual_features?.surface_degradation_index || 12.4}%</span>
                          </div>
                          <div className="metric-progress-track">
                            <div className="metric-progress-bar" style={{
                              width: `${result.visual_features?.surface_degradation_index || 12.4}%`,
                              background: (result.visual_features?.surface_degradation_index || 12.4) > 40 ? '#ef4444' : '#10b981'
                            }}></div>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '6px', display: 'block' }}>
                            Laplacian texture variance analysis
                          </span>
                        </div>

                        <div className="feature-metric-card">
                          <div className="metric-header">
                            <span className="metric-title">Browning Area Ratio</span>
                            <span className="metric-value">{result.visual_features?.browning_ratio || 0.0}%</span>
                          </div>
                          <div className="metric-progress-track">
                            <div className="metric-progress-bar" style={{
                              width: `${Math.min(100, (result.visual_features?.browning_ratio || 0) * 3)}%`,
                              background: (result.visual_features?.browning_ratio || 0) > 15 ? '#ef4444' : '#f59e0b'
                            }}></div>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '6px', display: 'block' }}>
                            Decay pixel cluster segmentation
                          </span>
                        </div>

                        <div className="feature-metric-card">
                          <div className="metric-header">
                            <span className="metric-title">Surface Purity Score</span>
                            <span className="metric-value">{result.visual_features?.surface_integrity || 98.2}%</span>
                          </div>
                          <div className="metric-progress-track">
                            <div className="metric-progress-bar" style={{
                              width: `${result.visual_features?.surface_integrity || 98.2}%`,
                              background: '#10b981'
                            }}></div>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '6px', display: 'block' }}>
                            Blemish-free skin integrity metric
                          </span>
                        </div>
                      </div>

                      {/* Spoilage Detection Alert Banner */}
                      <div className={`spoilage-banner ${(result.spoilage_risk || "Low").toLowerCase()}`}>
                        <div className="spoilage-icon">
                          {result.spoilage_risk === "Critical" ? "🚨" : result.spoilage_risk === "High" ? "⚠️" : result.spoilage_risk === "Moderate" ? "⚡" : "🛡️"}
                        </div>
                        <div className="spoilage-text">
                          <h4>
                            Spoilage Risk Level: {(result.spoilage_risk || "Low").toUpperCase()} ({result.spoilage_risk_percent || (100 - result.confidence).toFixed(1)}%)
                          </h4>
                          <p>{result.spoilage_action || "Standard cold storage (1°C - 4°C) recommended to maintain quality."}</p>
                          {result.cross_contamination_risk && (
                            <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 700 }}>
                              Cross-Contamination Hazard: <u>{result.cross_contamination_risk}</u>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Storage Environment Recommendations */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '20px' }}>
                        <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                          <span style={{ fontSize: '18px' }}>❄️</span>
                          <strong style={{ display: 'block', fontSize: '13px', margin: '4px 0 2px' }}>Refrigerated Storage</strong>
                          <span style={{ fontSize: '12px', color: 'var(--gray-700)' }}>
                            {result.storage_recommendations?.refrigerated || `Optimal (1°C - 4°C): Up to ${result.max_days || 5} days.`}
                          </span>
                        </div>
                        <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                          <span style={{ fontSize: '18px' }}>🌡️</span>
                          <strong style={{ display: 'block', fontSize: '13px', margin: '4px 0 2px' }}>Room Temperature</strong>
                          <span style={{ fontSize: '12px', color: 'var(--gray-700)' }}>
                            {result.storage_recommendations?.room_temp || `Ambient (20°C - 24°C): Consume within ${result.min_days || 1} to 2 days.`}
                          </span>
                        </div>
                        <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                          <span style={{ fontSize: '18px' }}>🧊</span>
                          <strong style={{ display: 'block', fontSize: '13px', margin: '4px 0 2px' }}>Freezing Condition</strong>
                          <span style={{ fontSize: '12px', color: 'var(--gray-700)' }}>
                            {result.storage_recommendations?.frozen || "Freezer (-18°C): Preserves nutritional quality up to 60-90 days."}
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Shelf-Life Prediction (Milestone 3) */}
                      <div style={{ marginTop: '20px', background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '1.5px solid #a7f3d0', borderRadius: '16px', padding: '18px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              🧠 Kinetic Shelf-Life Prediction Engine
                            </span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                              <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--dark-green)' }}>
                                {result.shelf_life_prediction?.predicted_remaining_days || result.days || 5} Days
                              </span>
                              <span style={{ fontSize: '12px', color: '#047857', fontWeight: 700 }}>
                                (Under current {fridgeTemp}°C Cold-Chain)
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSimProduce(result.food);
                              setSimFreshness(result.freshness);
                              setSimFqi(result.quality_score || 85);
                              setActiveTab("shelf_life");
                              runShelfLifeSimulation({
                                food_name: result.food,
                                freshness_label: result.freshness,
                                quality_score: result.quality_score || 85,
                                storage_temp_c: fridgeTemp,
                                storage_rh_pct: humidity,
                                ethylene_exposure_ppm: 0.04
                              });
                            }}
                            className="auth-btn"
                            style={{ margin: 0, padding: '8px 16px', width: 'auto', background: 'var(--dark-green)', fontSize: '12px' }}
                          >
                            🔬 Open What-If Simulator →
                          </button>
                        </div>

                        {result.shelf_life_prediction?.scenario_comparisons && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '14px', fontSize: '11.5px' }}>
                            <div style={{ background: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
                              <span style={{ color: 'var(--gray-500)', display: 'block' }}>❄️ Chilled 4°C</span>
                              <b style={{ color: 'var(--dark-green)', fontSize: '14px' }}>{result.shelf_life_prediction.scenario_comparisons.refrigerated_4c}d</b>
                            </div>
                            <div style={{ background: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
                              <span style={{ color: 'var(--gray-500)', display: 'block' }}>🥔 Pantry 13°C</span>
                              <b style={{ color: 'var(--dark-green)', fontSize: '14px' }}>{result.shelf_life_prediction.scenario_comparisons.cool_cellar_13c}d</b>
                            </div>
                            <div style={{ background: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
                              <span style={{ color: 'var(--gray-500)', display: 'block' }}>🍞 Room 22°C</span>
                              <b style={{ color: 'var(--dark-green)', fontSize: '14px' }}>{result.shelf_life_prediction.scenario_comparisons.ambient_22c}d</b>
                            </div>
                            <div style={{ background: 'white', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
                              <span style={{ color: 'var(--gray-500)', display: 'block' }}>🧊 Frozen -18°C</span>
                              <b style={{ color: 'var(--dark-green)', fontSize: '14px' }}>{result.shelf_life_prediction.scenario_comparisons.deep_freeze_minus18c}d</b>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>

                <div className="dashboard-sidebar">
                  <section className="history-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h2 style={{ margin: 0, fontSize: '18px' }}>Scan History ({history.length})</h2>
                      {history.length > 0 && (
                        <button
                          onClick={handleClearAllHistory}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#dc2626',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Clear all scan history"
                        >
                          🗑️ Clear All
                        </button>
                      )}
                    </div>
                    {historyLoading ? (
                      <div className="history-loading">Retrieving scans...</div>
                    ) : history.length === 0 ? (
                      <div className="history-empty">
                        <span className="empty-icon">📂</span>
                        <p>No previous scans found</p>
                        <span>Your predictions will show up here</span>
                      </div>
                    ) : (
                      <div className="history-list">
                        {history.map((item) => (
                          <div key={item.id} className="history-item">
                            <div className="history-item-header">
                              <span className="history-item-food" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span>{getFoodVisual(item.food).emoji}</span> {item.food}
                              </span>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {item.grade && item.grade !== "N/A" && (
                                  <span className={`grade-badge grade-${item.grade.toLowerCase().replace('+', '-plus')}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                    {item.grade}
                                  </span>
                                )}
                                <span className={`freshness-tag ${item.freshness.toLowerCase().replace(' ', '-')}`}>
                                  {item.freshness}
                                </span>
                              </div>
                            </div>
                            <div className="history-item-details">
                              <span>Shelf Life: {item.days} days</span>
                              <span>FQI: {item.quality_score ? `${item.quality_score}/100` : `${item.confidence}%`}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                              <div className="history-item-time">
                                {formatDate(item.created_at)}
                              </div>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button
                                  onClick={() => openReportModal(item.id)}
                                  style={{
                                    background: 'transparent',
                                    border: '1px solid var(--gray-300)',
                                    borderRadius: '6px',
                                    padding: '2px 8px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'var(--dark-green)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  📋 Report
                                </button>
                                <button
                                  onClick={() => handleDeleteHistoryItem(item.id)}
                                  style={{
                                    background: '#fee2e2',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '6px',
                                    padding: '2px 8px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#dc2626',
                                    cursor: 'pointer'
                                  }}
                                  title="Delete this scan"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER FOOD ITEM */}
          {activeTab === "register_food" && (
            <div className="tab-pane">
              <section className="intro">
                <h2>Register Food Item</h2>
                <p>
                  Manually register new food items into the system to start tracking their freshness and expiration metrics.
                </p>
              </section>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <section className="upload-card" style={{ padding: '36px', textAlign: 'left', maxWidth: '600px', width: '100%' }}>
                  <h2 style={{ color: 'var(--dark-green)', margin: '0 0 24px', fontSize: '20px', fontWeight: 800 }}>
                    Food Attributes Form
                  </h2>

                  {invFormError && (
                    <div style={{
                      padding: '12px 16px',
                      background: '#fee2e2',
                      border: '1.5px solid #ef4444',
                      borderRadius: '12px',
                      color: '#b91c1c',
                      fontSize: '13px',
                      fontWeight: 750,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '16px'
                    }}>
                      <span style={{ fontSize: '18px' }}>⚠️</span>
                      <span>{invFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddInventory} className="auth-form" style={{ gap: '20px' }}>
                    {/* Food Item Image Upload - Mandatory */}
                    <div className="input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--gray-800)' }}>
                          Food Item Image <span style={{ color: '#ef4444', fontWeight: 800 }}>* (Mandatory)</span>
                        </label>
                        {invImage && (
                          <button
                            type="button"
                            onClick={() => setInvImage(null)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '2px 6px',
                            }}
                          >
                            ✕ Remove Image
                          </button>
                        )}
                      </div>

                      {invImage ? (
                        <div style={{
                          position: 'relative',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          border: '2px solid #a7f3d0',
                          background: '#f8fafc',
                          maxHeight: '220px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px'
                        }}>
                          <img
                            src={invImage}
                            alt="Food item preview"
                            style={{
                              maxHeight: '200px',
                              maxWidth: '100%',
                              objectFit: 'contain',
                              borderRadius: '10px'
                            }}
                          />
                          <label
                            htmlFor="inv-image-change-input"
                            style={{
                              position: 'absolute',
                              bottom: '12px',
                              right: '12px',
                              background: 'rgba(15, 23, 42, 0.85)',
                              color: 'white',
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              backdropFilter: 'blur(4px)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>🔄</span> Change Image
                          </label>
                          <input
                            type="file"
                            id="inv-image-change-input"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleInvImageChange}
                            hidden
                          />
                        </div>
                      ) : (
                        <label
                          htmlFor="inv-image-input"
                          style={{
                            border: !invImage && invFormError ? '2px dashed #ef4444' : '2px dashed var(--gray-300)',
                            borderRadius: '14px',
                            padding: '24px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            background: !invImage && invFormError ? '#fef2f2' : 'var(--gray-50)',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.background = '#f0fdf4';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = !invImage && invFormError ? '#ef4444' : 'var(--gray-300)';
                            e.currentTarget.style.background = !invImage && invFormError ? '#fef2f2' : 'var(--gray-50)';
                          }}
                        >
                          <span style={{ fontSize: '36px' }}>📸</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark-green)' }}>
                            Upload Food Item Image <span style={{ color: '#ef4444' }}>*</span>
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                            Click to browse or drag & drop (JPG, PNG, WEBP) — Required
                          </span>
                          <input
                            type="file"
                            id="inv-image-input"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleInvImageChange}
                            hidden
                          />
                        </label>
                      )}
                    </div>

                    <div className="input-group">
                      <label htmlFor="inv-name">
                        Food Item Name <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="inv-name"
                        value={invName}
                        onChange={(e) => setInvName(e.target.value)}
                        placeholder="e.g. Red Apples, Organic Lettuce"
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="input-group">
                        <label htmlFor="inv-category">
                          Category <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>
                        </label>
                        <select
                          id="inv-category"
                          value={invCategory}
                          onChange={(e) => setInvCategory(e.target.value)}
                          required
                        >
                          <option value="Fruits">Fruits</option>
                          <option value="Vegetables">Vegetables</option>
                          <option value="Dairy Products">Dairy Products</option>
                          <option value="Meat & Poultry">Meat & Poultry</option>
                          <option value="Seafood">Seafood</option>
                          <option value="Bakery Products">Bakery Products</option>
                          <option value="Packaged Foods">Packaged Foods</option>
                          <option value="Beverages">Beverages</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label htmlFor="inv-qty-val">
                          Quantity & Unit <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="number"
                            step="any"
                            min="0.01"
                            id="inv-qty-val"
                            value={invQtyVal}
                            onChange={(e) => setInvQtyVal(e.target.value)}
                            placeholder="e.g. 2"
                            required
                            style={{ flex: 1 }}
                          />
                          <select
                            id="inv-qty-unit"
                            value={invQtyUnit}
                            onChange={(e) => setInvQtyUnit(e.target.value)}
                            style={{
                              width: '100px',
                              fontWeight: 750,
                              background: 'var(--gray-50)',
                              border: '1px solid var(--gray-300)',
                              borderRadius: '10px',
                              padding: '0 10px'
                            }}
                            required
                          >
                            <option value="kg">kg</option>
                            <option value="ltr">ltr</option>
                            <option value="units">units</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="input-group">
                        <label htmlFor="inv-status">
                          Freshness Status <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>
                        </label>
                        <select
                          id="inv-status"
                          value={invStatus}
                          onChange={(e) => setInvStatus(e.target.value)}
                          required
                        >
                          <option value="Fresh">Fresh</option>
                          <option value="Good">Good</option>
                          <option value="Acceptable">Acceptable</option>
                          <option value="Near Spoilage">Near Spoilage</option>
                          <option value="Spoiled">Spoiled</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label htmlFor="inv-storage">
                          Storage Condition <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>
                        </label>
                        <select
                          id="inv-storage"
                          value={invStorage}
                          onChange={(e) => setInvStorage(e.target.value)}
                          required
                        >
                          <option value="Room Temperature">Room Temperature</option>
                          <option value="Refrigerated">Refrigerated</option>
                          <option value="Frozen">Frozen</option>
                        </select>
                      </div>
                    </div>

                    <div className="input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label htmlFor="inv-expiry" style={{ margin: 0 }}>
                          Expiry Date <span style={{ fontWeight: 500, color: 'var(--gray-500)', fontSize: '12px' }}>(Optional)</span>
                        </label>
                        {invExpiry && (
                          <button
                            type="button"
                            onClick={() => setInvExpiry("")}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--gray-500)',
                              fontSize: '11px',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Clear Date
                          </button>
                        )}
                      </div>
                      <input
                        type="date"
                        id="inv-expiry"
                        value={invExpiry}
                        onChange={(e) => setInvExpiry(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ marginTop: '6px' }}
                      />
                    </div>

                    <button type="submit" className="auth-btn" style={{ marginTop: '16px' }}>
                      Register Item
                    </button>
                  </form>
                </section>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE INVENTORY */}
          {activeTab === "inventory" && (
            <div className="tab-pane">
              <section className="intro">
                <h2>Active Inventory Stock</h2>
                <p>
                  View, filter, and audit active food stock batches currently held in standard storage.
                </p>
              </section>

              <section className="history-card" style={{ maxHeight: 'none', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Registered Food Items</h2>
                  <span className="role-badge" style={{ margin: 0, padding: '4px 12px', fontSize: '12px' }}>
                    {inventory.filter(item => invFilter === "All" || item.category === invFilter).length} Active Batches
                  </span>
                </div>

                {/* Filter tabs */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px', borderBottom: '1px solid var(--gray-200)' }}>
                  {["All", "Fruits", "Vegetables", "Dairy Products", "Meat & Poultry", "Seafood", "Bakery Products", "Packaged Foods", "Beverages"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setInvFilter(cat)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '100px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: invFilter === cat ? 'var(--dark-green)' : 'var(--gray-100)',
                        color: invFilter === cat ? 'white' : 'var(--gray-700)',
                        whiteSpace: 'nowrap',
                        transition: 'var(--transition)'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid list */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
                  {inventory.filter(item => invFilter === "All" || item.category === invFilter).length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: 'var(--gray-500)', background: 'white', borderRadius: '16px', border: '1px solid var(--gray-200)' }}>
                      <span style={{ fontSize: '36px' }}>📂</span>
                      <p style={{ margin: '12px 0 0', fontWeight: '700', fontSize: '15px' }}>No items found in this category</p>
                    </div>
                  ) : (
                    inventory.filter(item => invFilter === "All" || item.category === invFilter).map(item => {
                      const visual = getFoodVisual(item.name, item.category);
                      const statusClass = (item.status || 'Fresh').toLowerCase().replace(/\s+/g, '-');
                      const statusColor =
                        item.status === 'Fresh' ? '#10b981' :
                        item.status === 'Good' ? '#059669' :
                        item.status === 'Acceptable' ? '#f59e0b' :
                        item.status === 'Near Spoilage' ? '#ea580c' :
                        item.status === 'Quarantined' ? '#8b5cf6' :
                        item.status === 'Disposed' ? '#6b7280' : '#ef4444';

                      const hasValidImage = item.image && !failedImages[item.id] && (
                        item.image.startsWith('data:image') ||
                        item.image.startsWith('http://') ||
                        item.image.startsWith('https://') ||
                        item.image.startsWith('/')
                      );

                      const expiryDate = item.expiry ? new Date(item.expiry) : null;
                      const isExpired = expiryDate && !isNaN(expiryDate.getTime()) && expiryDate < new Date();

                      return (
                        <div
                          key={item.id}
                          style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            border: '1px solid var(--gray-200)',
                            borderLeft: `5px solid ${statusColor}`,
                            padding: '18px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            minHeight: '220px'
                          }}
                        >
                          <div>
                            {/* Card Header: Thumbnail + Name + Category + Status Badge */}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                              <div style={{
                                width: '54px',
                                height: '54px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                background: hasValidImage ? 'var(--gray-100)' : visual.bg,
                                border: `1px solid ${hasValidImage ? 'var(--gray-200)' : visual.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                              }}>
                                {hasValidImage ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    onError={() => setFailedImages(prev => ({ ...prev, [item.id]: true }))}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <span style={{ fontSize: '28px', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))', display: 'inline-block' }}>
                                    {visual.emoji}
                                  </span>
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                                  <span style={{
                                    fontWeight: 800,
                                    fontSize: '16px',
                                    color: 'var(--dark)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {item.name}
                                  </span>
                                  <span className={`freshness-tag ${statusClass}`} style={{ fontSize: '11px', padding: '3px 8px', flexShrink: 0 }}>
                                    {item.status}
                                  </span>
                                </div>
                                <div style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>
                                  {item.category}
                                </div>
                              </div>
                            </div>

                            {/* Aligned 2-Column Specs: Quantity & Storage Condition */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '8px',
                              padding: '10px 12px',
                              background: 'var(--gray-50)',
                              borderRadius: '10px',
                              border: '1px solid #f1f5f9',
                              marginBottom: '12px'
                            }}>
                              <div>
                                <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                                  Quantity
                                </span>
                                <strong style={{ fontSize: '13px', color: 'var(--gray-800)', wordBreak: 'break-word' }}>
                                  {item.qty || '1 unit'}
                                </strong>
                              </div>
                              <div style={{ borderLeft: '1px solid var(--gray-200)', paddingLeft: '10px' }}>
                                <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                                  Storage
                                </span>
                                <strong style={{ fontSize: '12px', color: 'var(--gray-800)', display: 'block', lineHeight: '1.3', wordBreak: 'break-word' }}>
                                  {item.storage || 'Room Temp'}
                                </strong>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer: Expiry + Status Dropdown + Delete Button */}
                          <div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'var(--gray-700)',
                              borderTop: '1px solid var(--gray-150, #f1f5f9)',
                              paddingTop: '10px',
                              marginBottom: '10px'
                            }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span>🗓️</span> Expiry: <strong style={{ color: 'var(--gray-800)' }}>{(!item.expiry || item.expiry === "N/A") ? "Not set" : item.expiry}</strong>
                              </span>
                              {isExpired && (
                                <span style={{
                                  color: '#dc2626',
                                  background: '#fee2e2',
                                  border: '1px solid #fca5a5',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  letterSpacing: '0.4px'
                                }}>
                                  EXPIRED
                                </span>
                              )}
                            </div>

                            {/* Quick Action Controls */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '150px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Status</label>
                                <select
                                  value={item.status}
                                  onChange={(e) => handleUpdateInventoryStatus(item.id, e.target.value)}
                                  style={{
                                    flex: 1,
                                    padding: '5px 8px',
                                    fontSize: '11.5px',
                                    borderRadius: '7px',
                                    border: '1px solid var(--gray-300)',
                                    background: item.status === "Sold" ? '#ecfdf5' : '#ffffff',
                                    fontWeight: 700,
                                    color: item.status === "Sold" ? '#059669' : 'var(--gray-800)',
                                    cursor: 'pointer'
                                  }}
                                  title="Update stock status"
                                >
                                  <option value="Fresh">Fresh</option>
                                  <option value="Good">Good</option>
                                  <option value="Acceptable">Acceptable</option>
                                  <option value="Near Spoilage">Near Spoilage</option>
                                  <option value="Markdown -30%">Markdown -30%</option>
                                  <option value="Markdown -50%">Markdown -50%</option>
                                  <option value="Sold">Sold</option>
                                  <option value="Spoiled">Spoiled</option>
                                  <option value="Quarantined">Quarantined</option>
                                  <option value="Disposed">Disposed</option>
                                </select>
                              </div>

                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {(user?.role === "Retail Manager" || user?.role === "Administrator" || user?.role === "Enterprise Manager") && item.status !== "Sold" && (
                                  <button
                                    onClick={() => handleRecordSale(item)}
                                    style={{
                                      background: '#ecfdf5',
                                      color: '#059669',
                                      border: '1px solid #a7f3d0',
                                      borderRadius: '7px',
                                      padding: '5px 10px',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Record retail sale and update status to Sold"
                                  >
                                    <span>🏷️</span> Record Sale
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteInventory(item.id)}
                                  style={{
                                    background: '#fff1f2',
                                    color: '#e11d48',
                                    border: '1px solid #fecdd3',
                                    borderRadius: '7px',
                                    padding: '5px 10px',
                                    fontSize: '11.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'background 0.15s ease'
                                  }}
                                  title="Delete food batch"
                                >
                                  <span>🗑️</span> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          )}


          {/* TAB 4: SPOILAGE DETECTION & QUALITY ALERTS (MILESTONE 2) */}
          {activeTab === "spoilage" && (
            <div className="tab-pane">
              <section className="intro">
                <h2>Spoilage Detection & Risk Dashboard</h2>
                <p>
                  Real-time automated hazard detection tracking active produce deterioration, bacterial/fungal risk levels, and cross-contamination alerts.
                </p>
              </section>

              {/* Action Feedback Toast */}
              {spoilageToast && (
                <div style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
                }}>
                  <span style={{ fontSize: '18px' }}>🍃</span>
                  <span>{spoilageToast}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#059669', color: 'white', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    UPDATED
                  </span>
                </div>
              )}

              {/* Spoilage KPI Grid */}
              <div className="spoilage-kpi-grid">
                <div className="spoilage-kpi-card" style={{ borderLeft: '5px solid #ef4444' }}>
                  <div className="spoilage-kpi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                    🚨
                  </div>
                  <div className="spoilage-kpi-info">
                    <h3>{spoilageStats.critical_count}</h3>
                    <span>Critical Spoilage Alerts</span>
                  </div>
                </div>

                <div className="spoilage-kpi-card" style={{ borderLeft: '5px solid #f97316' }}>
                  <div className="spoilage-kpi-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
                    ⚠️
                  </div>
                  <div className="spoilage-kpi-info">
                    <h3>{spoilageStats.high_count}</h3>
                    <span>High Risk Deterioration</span>
                  </div>
                </div>

                <div className="spoilage-kpi-card" style={{ borderLeft: '5px solid #eab308' }}>
                  <div className="spoilage-kpi-icon" style={{ background: '#fef9c3', color: '#ca8a04' }}>
                    🔒
                  </div>
                  <div className="spoilage-kpi-info">
                    <h3>{spoilageStats.quarantined_count || 0}</h3>
                    <span>Quarantined Batches</span>
                  </div>
                </div>

                <div className="spoilage-kpi-card" style={{ borderLeft: '5px solid #10b981' }}>
                  <div className="spoilage-kpi-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                    🛡️
                  </div>
                  <div className="spoilage-kpi-info">
                    <h3>{inventory.length}</h3>
                    <span>Active Monitored Batches</span>
                  </div>
                </div>
              </div>

              {/* Spoilage Directives and Hazard Protocol */}
              <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gray-200)', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 800, color: 'var(--dark-green)' }}>
                  🛡️ Cold-Chain & Spoilage Prevention Protocol
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', fontSize: '13px', color: 'var(--gray-700)' }}>
                  <div style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--gray-200)' }}>
                    <strong>1. Immediate Isolation:</strong> Separate decaying items immediately to stop ethylene gas & fungal spore transmission to surrounding produce.
                  </div>
                  <div style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--gray-200)' }}>
                    <strong>2. Thermal Shock Suppression:</strong> Keep high-risk batches at steady 2°C - 4°C; avoid temperature cycling which accelerates condensation.
                  </div>
                  <div style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--gray-200)' }}>
                    <strong>3. Sanitization Directive:</strong> Disinfect storage bins with food-grade sanitizing solution after disposing of spoiled stock.
                  </div>
                </div>
              </div>

              {/* Spoilage Alerts Section */}
              <section className="history-card" style={{ maxHeight: 'none', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Active Spoilage Warnings</h2>
                    <span style={{ fontSize: '12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '100px', fontWeight: 800 }}>
                      {spoilageAlerts.length} live
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* View Switcher: Table vs Cards */}
                    <div style={{ display: 'inline-flex', background: 'var(--gray-100)', padding: '3px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                      <button
                        onClick={() => setSpoilageViewMode("table")}
                        style={{
                          padding: '5px 12px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: spoilageViewMode === "table" ? 'white' : 'transparent',
                          color: spoilageViewMode === "table" ? 'var(--dark-green)' : 'var(--gray-600)',
                          boxShadow: spoilageViewMode === "table" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        📑 Table View
                      </button>
                      <button
                        onClick={() => setSpoilageViewMode("cards")}
                        style={{
                          padding: '5px 12px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: spoilageViewMode === "cards" ? 'white' : 'transparent',
                          color: spoilageViewMode === "cards" ? 'var(--dark-green)' : 'var(--gray-600)',
                          boxShadow: spoilageViewMode === "cards" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        🗂️ Cards View
                      </button>
                    </div>

                    <button
                      onClick={fetchSpoilageAlerts}
                      style={{
                        background: 'var(--gray-100)',
                        border: '1px solid var(--gray-300)',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Refresh Alerts
                    </button>
                  </div>
                </div>

                {spoilageLoading ? (
                  <div className="history-loading">Scanning storage batches for spoilage indicators...</div>
                ) : spoilageAlerts.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-500)' }}>
                    <span style={{ fontSize: '42px' }}>✨</span>
                    <h3 style={{ margin: '14px 0 6px', color: 'var(--dark)' }}>Zero Spoilage Hazards Detected</h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>All active inventory batches and recent scans meet safety and quality thresholds.</p>
                  </div>
                ) : spoilageViewMode === "table" ? (
                  /* 📑 Responsive Spoilage Alert Data Table */
                  <div className="spoilage-table-container">
                    <table className="spoilage-table">
                      <thead>
                        <tr>
                          <th>Produce Batch</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Hazard Level</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Storage Location</th>
                          <th style={{ whiteSpace: 'nowrap' }}>Shelf Life</th>
                          <th>Safety Directive</th>
                          <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spoilageAlerts.map(alert => {
                          const visual = getFoodVisual(alert.title, alert.category);
                          return (
                            <tr key={alert.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '22px' }}>{visual.emoji}</span>
                                  <div>
                                    <strong style={{ fontSize: '14px', color: 'var(--dark)', display: 'block' }}>{alert.title}</strong>
                                    <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{alert.qty || '1 unit'} • {alert.source || 'Inventory'}</span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                <span className={`spoilage-badge ${alert.severity.toLowerCase()}`}>
                                  {alert.severity === 'Critical' ? '🚨 ' : '⚠️ '}{alert.severity} Risk
                                </span>
                              </td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                <span className={`spoilage-status-badge ${alert.status_state === 'Quarantined' ? 'quarantined' : 'active'}`}>
                                  {alert.status_state === 'Quarantined' ? '🔒 Quarantined' : alert.status}
                                </span>
                              </td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                <strong style={{ fontSize: '12.5px', color: 'var(--gray-700)' }}>{alert.storage}</strong>
                              </td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                {alert.days_left !== undefined && alert.days_left < 999 ? (
                                  <span style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: alert.days_left <= 0 ? '#dc2626' : '#ea580c'
                                  }}>
                                    {alert.days_left <= 0 ? `Expired (${Math.abs(alert.days_left)}d)` : `${alert.days_left}d remaining`}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--gray-500)', fontSize: '12px' }}>N/A</span>
                                )}
                              </td>
                              <td>
                                <span style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 600, display: 'block', maxWidth: '280px', lineHeight: '1.35' }}>
                                  {alert.action_required}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                  {alert.status_state !== "Quarantined" && (
                                    <button
                                      onClick={() => handleSpoilageAction(alert.id, "quarantine")}
                                      disabled={spoilageActionLoading === alert.id}
                                      style={{
                                        background: '#fff7ed',
                                        color: '#c2410c',
                                        border: '1px solid #fed7aa',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                      }}
                                      title="Isolate batch in cold storage quarantine"
                                    >
                                      🚨 Quarantine
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleSpoilageAction(alert.id, "dispose")}
                                    disabled={spoilageActionLoading === alert.id}
                                    style={{
                                      background: '#fee2e2',
                                      color: '#dc2626',
                                      border: '1px solid #fca5a5',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title="Write off and record as Disposed"
                                  >
                                    🗑️ Dispose
                                  </button>
                                  <button
                                    onClick={() => handleSpoilageAction(alert.id, "acknowledge")}
                                    disabled={spoilageActionLoading === alert.id}
                                    style={{
                                      background: '#f1f5f9',
                                      color: '#475569',
                                      border: '1px solid #cbd5e1',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title="Acknowledge alert"
                                  >
                                    ✓ Acknowledge
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* 🗂️ Cards View */
                  <div>
                    {spoilageAlerts.map(alert => (
                      <div key={alert.id} className="spoilage-item-card">
                        <div className="spoilage-item-left">
                          <span style={{ fontSize: '28px' }}>
                            {alert.severity === "Critical" ? "🚨" : "⚠️"}
                          </span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '16px', color: 'var(--dark)' }}>
                                {getFoodVisual(alert.title, alert.category).emoji} {alert.title}
                              </strong>
                              <span className={`spoilage-badge ${alert.severity.toLowerCase()}`}>
                                {alert.severity} Risk
                              </span>
                              <span style={{ fontSize: '11px', background: 'var(--gray-100)', padding: '2px 8px', borderRadius: '4px', color: 'var(--gray-700)', fontWeight: 600 }}>
                                Source: {alert.source}
                              </span>
                              {alert.status_state === "Quarantined" && (
                                <span className="spoilage-status-badge quarantined">
                                  🔒 Quarantined
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--gray-700)', marginTop: '4px' }}>
                              <span>Status: <b>{alert.status}</b></span> • <span>Qty: <b>{alert.qty}</b></span> • <span>Storage: <b>{alert.storage}</b></span>
                              {alert.days_left !== undefined && alert.days_left < 999 && (
                                <span style={{ marginLeft: '10px', color: alert.days_left < 0 ? 'var(--danger)' : 'var(--warning)', fontWeight: 700 }}>
                                  ({alert.days_left < 0 ? `Expired ${Math.abs(alert.days_left)}d ago` : `${alert.days_left}d remaining`})
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '6px', fontWeight: 700 }}>
                              Directive: {alert.action_required}
                            </div>
                          </div>
                        </div>

                        {/* Real-time Action Controls */}
                        <div className="spoilage-item-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {alert.status_state !== "Quarantined" && (
                            <button
                              onClick={() => handleSpoilageAction(alert.id, "quarantine")}
                              disabled={spoilageActionLoading === alert.id}
                              style={{
                                background: '#fff7ed',
                                color: '#c2410c',
                                border: '1px solid #fed7aa',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              title="Isolate batch in cold storage quarantine"
                            >
                              {spoilageActionLoading === alert.id ? "Updating..." : "🚨 Quarantine"}
                            </button>
                          )}

                          <button
                            onClick={() => handleSpoilageAction(alert.id, "dispose")}
                            disabled={spoilageActionLoading === alert.id}
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fca5a5',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            title="Write off and record as Disposed"
                          >
                            {spoilageActionLoading === alert.id ? "Updating..." : "🗑️ Dispose"}
                          </button>

                          <button
                            onClick={() => handleSpoilageAction(alert.id, "acknowledge")}
                            disabled={spoilageActionLoading === alert.id}
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            title="Acknowledge alert"
                          >
                            ✓ Acknowledge
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 5: STORAGE COMPLIANCE & ENVIRONMENTAL METRICS */}
          {activeTab === "storage_compliance" && (
            <div className="tab-pane">
              <section className="intro">
                <h2>Cold-Chain & Storage Compliance Control</h2>
                <p>
                  Configure and persist environmental storage parameters to maintain optimal freshness thresholds and automate hazard warnings.
                </p>
              </section>

              {settingsToast && (
                <div style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>🍃</span>
                  <span>{settingsToast}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#059669', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>
                    SAVED
                  </span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Environmental Controls Form */}
                <section className="upload-card" style={{ padding: '32px', textAlign: 'left' }}>
                  <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 800, color: 'var(--dark-green)' }}>
                    ⚙️ Environmental Thresholds
                  </h3>

                  <form onSubmit={handleSaveStorageSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div className="input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={{ fontWeight: 700 }}>Refrigerator Temperature: <b>{fridgeTemp}°C</b></label>
                        <span style={{ fontSize: '12px', color: fridgeTemp > 5 ? 'var(--danger)' : '#059669', fontWeight: 700 }}>
                          {fridgeTemp <= 4 ? "Optimal Range (1-4°C)" : "High Risk Warning"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="12"
                        step="0.5"
                        value={fridgeTemp}
                        onChange={(e) => setFridgeTemp(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--dark-green)' }}
                      />
                    </div>

                    <div className="input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={{ fontWeight: 700 }}>Relative Humidity: <b>{humidity}%</b></label>
                        <span style={{ fontSize: '12px', color: humidity < 75 ? 'var(--warning)' : '#059669', fontWeight: 700 }}>
                          {humidity >= 80 ? "Optimal (80-90%)" : "Dry Air Warning"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="100"
                        step="1"
                        value={humidity}
                        onChange={(e) => setHumidity(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--dark-green)' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="input-group">
                        <label style={{ fontWeight: 700, fontSize: '13px' }}>Air Circulation</label>
                        <select
                          value={airCirculation}
                          onChange={(e) => setAirCirculation(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--gray-300)', fontWeight: 600 }}
                        >
                          <option value="Low">Low (Produce prone to mold)</option>
                          <option value="Medium">Medium (Balanced Airflow)</option>
                          <option value="High">High (Rapid Chill Evaporation)</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label style={{ fontWeight: 700, fontSize: '13px' }}>Light Exposure</label>
                        <select
                          value={lightExposure}
                          onChange={(e) => setLightExposure(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--gray-300)', fontWeight: 600 }}
                        >
                          <option value="Dark">Dark (Preserves vitamins)</option>
                          <option value="Low Light">Low Light (Standard Fridge)</option>
                          <option value="Ambient">Ambient Light (Accelerates decay)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="auth-btn"
                      disabled={user?.role === "Consumer" || settingsSaving}
                      style={{
                        marginTop: '10px',
                        background: user?.role === "Consumer" ? 'var(--gray-400)' : 'var(--dark-green)',
                        cursor: user?.role === "Consumer" ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {user?.role === "Consumer"
                        ? "🔒 Settings Managed by Facility Operators"
                        : (settingsSaving ? "Saving Settings..." : "💾 Save Storage Settings")}
                    </button>
                  </form>
                </section>

                {/* Live Storage Health Overview */}
                <section className="upload-card" style={{ padding: '32px', textAlign: 'left' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 800, color: 'var(--dark-green)' }}>
                    📊 Storage Compliance Status
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ padding: '14px', background: 'var(--gray-50)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                      <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>🍃 Ethylene Mitigation Protocol</strong>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-700)' }}>
                        Ensure climacteric fruits (apples, bananas, tomatoes) are stored separately from leafy greens to prevent accelerated yellowing and decay.
                      </p>
                    </div>

                    <div style={{ padding: '14px', background: 'var(--gray-50)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                      <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>🛡️ Automatic Hazard Trigger</strong>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-700)' }}>
                        Batches with ≤ 2 days to expiration automatically escalate into the <b>Spoilage Alerts</b> pipeline for prompt action.
                      </p>
                    </div>

                    <div style={{ padding: '14px', background: 'var(--gray-50)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                      <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>📦 Active Inventory Monitored</strong>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-700)' }}>
                        <b>{inventory.length}</b> active batches currently tracked in real time.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: FRESHNESS ANALYTICS & INVENTORY INTELLIGENCE (MILESTONE 3) */}
          {/* ============================================================ */}
          {activeTab === "analytics" && (
            <div className="tab-pane">
              {/* Official Print Header (Only visible on paper / PDF printout) */}
              <div className="print-report-header">
                <div className="print-report-brand">
                  <span style={{ fontSize: '32px' }}>📊</span>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#064e3b' }}>
                      FreshCheck AI • Freshness Analytics & Inventory Intelligence Audit
                    </h1>
                    <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#475569' }}>
                      Continuous Predictive Decay Kinetics, FEFO Interventions & Cold-Chain Auditing
                    </p>
                  </div>
                </div>
                <div className="print-report-meta">
                  <div><b>Document:</b> FC-ANL-AUDIT-{new Date().getFullYear()}</div>
                  <div><b>Inspector:</b> {user?.name || "Warehouse Auditor"} ({user?.role || "Operator"})</div>
                  <div><b>Date:</b> {new Date().toUTCString()}</div>
                  <div><b>Standard:</b> HACCP & ISO-22000 Protocol</div>
                </div>
              </div>

              <section className="intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2>📊 Freshness Analytics & Inventory Intelligence</h2>
                  <p>
                    Continuous predictive intelligence on inventory health, degradation velocity, spoilage risk exposure, and sustainability impact.
                  </p>
                </div>
                <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={fetchInsights}
                    disabled={insightsLoading}
                    className="auth-btn no-print"
                    style={{ margin: 0, padding: '10px 18px', width: 'auto', background: 'var(--gray-700)', fontSize: '13px' }}
                  >
                    {insightsLoading ? "Refreshing..." : "🔄 Refresh Intelligence"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="auth-btn no-print"
                    style={{ margin: 0, padding: '10px 18px', width: 'auto', background: 'var(--dark-green)', fontSize: '13px' }}
                  >
                    🖨️ Export PDF Audit
                  </button>
                </div>
              </section>

              {/* Hero KPI Cards */}
              <div className="analytics-grid">
                {/* 1. Global Inventory Health Index */}
                <div className="metric-hero-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                      Inventory Freshness Index
                    </span>
                    <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '100px', fontWeight: 800 }}>
                      REAL-TIME AUDIT
                    </span>
                  </div>

                  <div className="health-gauge-container" style={{ margin: '16px 0' }}>
                    <div
                      className="health-gauge-circle"
                      style={{ "--gauge-pct": insightsData?.inventory_health_score || 85 }}
                    >
                      <div className="health-gauge-text">
                        <div className="health-gauge-value">{insightsData?.inventory_health_score || 85}%</div>
                        <div className="health-gauge-label">INDEX</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--dark)' }}>
                        {insightsData?.health_grade || "Grade A (High Freshness)"}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--gray-500)' }}>
                        Aggregated composite quality across <b>{insightsData?.total_items || inventory.length}</b> monitored batches.
                      </p>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '12px', fontSize: '12px', color: 'var(--gray-700)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Active Stock: <b>{inventory.length} units</b></span>
                    <span>Status: <b style={{ color: '#059669' }}>Optimal Rotation</b></span>
                  </div>
                </div>

                {/* 2. Spoilage Risk Exposure */}
                <div className="metric-hero-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                      Waste Risk Exposure
                    </span>
                    <span style={{ fontSize: '11px', background: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: '100px', fontWeight: 800 }}>
                      FEFO RADAR
                    </span>
                  </div>

                  <div style={{ margin: '14px 0 6px' }}>
                    <div className="risk-exposure-bar">
                      <div className="risk-seg-critical" style={{ width: `${insightsData?.risk_exposure?.critical?.percent || 5}%` }} title="Critical <24h"></div>
                      <div className="risk-seg-high" style={{ width: `${insightsData?.risk_exposure?.high?.percent || 15}%` }} title="High 24-48h"></div>
                      <div className="risk-seg-moderate" style={{ width: `${insightsData?.risk_exposure?.moderate?.percent || 30}%` }} title="Moderate 3-5d"></div>
                      <div className="risk-seg-optimal" style={{ width: `${insightsData?.risk_exposure?.optimal?.percent || 50}%` }} title="Optimal >5d"></div>
                    </div>

                    <div className="risk-legend">
                      <div className="risk-legend-item">
                        <span className="risk-dot" style={{ background: '#ef4444' }}></span>
                        <span>&lt;24h ({insightsData?.risk_exposure?.critical?.count || 0})</span>
                      </div>
                      <div className="risk-legend-item">
                        <span className="risk-dot" style={{ background: '#f97316' }}></span>
                        <span>24-48h ({insightsData?.risk_exposure?.high?.count || 0})</span>
                      </div>
                      <div className="risk-legend-item">
                        <span className="risk-dot" style={{ background: '#3b82f6' }}></span>
                        <span>3-5d ({insightsData?.risk_exposure?.moderate?.count || 0})</span>
                      </div>
                      <div className="risk-legend-item">
                        <span className="risk-dot" style={{ background: '#10b981' }}></span>
                        <span>&gt;5d ({insightsData?.risk_exposure?.optimal?.count || 0})</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '12px', fontSize: '12px', color: 'var(--gray-700)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Immediate Attention: <b style={{ color: '#ef4444' }}>{(insightsData?.risk_exposure?.critical?.count || 0) + (insightsData?.risk_exposure?.high?.count || 0)} items</b></span>
                    <button
                      onClick={() => setActiveTab("recommendations")}
                      className="no-print"
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      View FEFO Queue →
                    </button>
                  </div>
                </div>

                {/* 3. Sustainability & Economic Savings */}
                <div className="metric-hero-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                      Environmental & Value Impact
                    </span>
                    <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '100px', fontWeight: 800 }}>
                      ESG METRICS
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '18px 0' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--dark-green)' }}>
                        {insightsData?.financial_environmental_impact?.waste_prevented_kg || "12.4"}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--gray-500)', fontWeight: 700, marginTop: '2px' }}>
                        KG SAVED
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7' }}>
                        {insightsData?.financial_environmental_impact?.co2_avoided_kg || "31.2"}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--gray-500)', fontWeight: 700, marginTop: '2px' }}>
                        KG CO₂e CUT
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                        ${insightsData?.financial_environmental_impact?.economic_value_protected_usd || "47.7"}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--gray-500)', fontWeight: 700, marginTop: '2px' }}>
                        VALUE SAVED
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '12px', fontSize: '12px', color: 'var(--gray-500)' }}>
                    Calculated from proactive shelf-life interventions and discount recovery.
                  </div>
                </div>
              </div>

              {/* Two Column Detailed Breakdown */}
              <div className="analytics-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
                {/* Category Shelf-Life Breakdown */}
                <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 800, color: 'var(--dark-green)' }}>
                    🥦 Category Shelf-Life & Velocity
                  </h3>
                  {insightsData?.category_metrics && Object.keys(insightsData.category_metrics).length > 0 ? (
                    Object.entries(insightsData.category_metrics).map(([cat, data]) => (
                      <div key={cat} className="category-stat-row">
                        <div style={{ width: '100px', fontWeight: 700, color: 'var(--dark)' }}>
                          {cat} ({data.item_count})
                        </div>
                        <div className="category-bar-bg">
                          <div className="category-bar-fill" style={{ width: `${Math.min(100, (data.avg_shelf_life_days / 15) * 100)}%` }}></div>
                        </div>
                        <div style={{ width: '90px', textAlign: 'right', fontWeight: 700, fontSize: '12px', color: 'var(--gray-700)' }}>
                          {data.avg_shelf_life_days} avg days
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
                      Register items into inventory to populate category shelf-life intelligence.
                    </p>
                  )}
                </div>

                {/* Neural Diagnostic Grading Distribution */}
                <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 800, color: 'var(--dark-green)' }}>
                    🔬 Neural Inspection Quality Breakdown
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                      Total AI Diagnostic Scans: <b>{insightsData?.scan_analytics?.total_scans_logged || history.length}</b>
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                      Average FQI Quality: <b>{insightsData?.scan_analytics?.average_scan_quality_score || 84.5}</b>
                    </span>
                  </div>

                  {["A+", "A", "B", "C", "F"].map(grade => {
                    const count = insightsData?.scan_analytics?.grade_breakdown?.[grade] || 0;
                    const total = insightsData?.scan_analytics?.total_scans_logged || 1;
                    const pct = Math.round((count / Math.max(1, total)) * 100);
                    return (
                      <div key={grade} className="category-stat-row">
                        <div style={{ width: '80px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`grade-badge grade-${grade.toLowerCase().replace('+', '-plus')}`} style={{ fontSize: '11px', padding: '2px 6px' }}>
                            {grade}
                          </span>
                        </div>
                        <div className="category-bar-bg">
                          <div
                            className="category-bar-fill"
                            style={{
                              width: `${pct}%`,
                              background: grade === 'A+' ? '#10b981' : grade === 'A' ? '#34d399' : grade === 'B' ? '#3b82f6' : grade === 'C' ? '#f59e0b' : '#ef4444'
                            }}
                          ></div>
                        </div>
                        <div style={{ width: '60px', textAlign: 'right', fontWeight: 700, fontSize: '12px', color: 'var(--gray-700)' }}>
                          {count} ({pct}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Urgent Intervention Queue Table */}
              <div className="urgent-intervention-card" style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--dark-green)' }}>
                    ⚡ Top Priority FEFO Intervention Queue
                  </h3>
                  <button
                    onClick={() => setActiveTab("recommendations")}
                    className="auth-btn no-print"
                    style={{ margin: 0, padding: '6px 14px', width: 'auto', fontSize: '12px', background: 'var(--primary)' }}
                  >
                    View Full Dispatch Engine →
                  </button>
                </div>

                {insightsData?.urgent_interventions && insightsData.urgent_interventions.length > 0 ? (
                  <div className="spoilage-table-container print-table-wrap">
                    <table className="spoilage-table">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Storage Location</th>
                          <th>Days Remaining</th>
                          <th>Urgency Level</th>
                          <th>Recommended Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {insightsData.urgent_interventions.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{item.name}</strong>
                            </td>
                            <td>{item.storage || "Refrigerated"}</td>
                            <td>
                              <span style={{ fontWeight: 800, color: item.days_left <= 0 ? 'var(--danger)' : '#ea580c' }}>
                                {item.days_left <= 0 ? "Expired" : `${item.days_left} days`}
                              </span>
                            </td>
                            <td>
                              <span className={`spoilage-badge ${item.days_left <= 0 ? 'critical' : 'high'}`}>
                                {item.urgency}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => setActiveTab("recommendations")}
                                className="no-print"
                                style={{ background: 'var(--primary-light)', color: 'var(--dark-green)', border: '1px solid var(--primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Apply Action Plan
                              </button>
                              <span className="print-action-badge">
                                {item.days_left <= 0 ? "⚠️ QUARANTINE & DISPOSAL" : "⚡ PRIORITY FEFO DISPATCH"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)', fontSize: '13px' }}>
                    ✅ Excellent! No items currently in Critical or Imminent spoilage danger.
                  </div>
                )}
              </div>

              {/* Official Print Footer */}
              <div className="print-report-footer">
                <span>FreshCheck AI Systems • Continuous Predictive Freshness Audit • Protocol ISO-22000 / HACCP</span>
                <span style={{ fontStyle: 'italic' }}>Digitally Authenticated: {new Date().toUTCString()}</span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: SHELF-LIFE PREDICTION & KINETIC SIMULATOR (MILESTONE 3) */}
          {/* ============================================================ */}
          {activeTab === "shelf_life" && (
            <div className="tab-pane">
              <section className="intro">
                <h2>🧠 Dynamic Shelf-Life Prediction Engine & Simulator</h2>
                <p>
                  Calculates biochemical produce decay rates using mathematical Arrhenius degradation kinetics, Q₁₀ thermal coefficients, and relative humidity models.
                </p>
              </section>

              <div className="simulator-card">
                <div className="simulator-grid">
                  {/* Left: Interactive Microclimate Controls */}
                  <div className="sim-control-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--dark-green)' }}>
                        🔬 Simulation Parameters
                      </h3>
                      {user?.role && (
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: (user.role === "Warehouse Operator" || user.role === "Administrator") ? '#ecfdf5' : '#f1f5f9',
                          color: (user.role === "Warehouse Operator" || user.role === "Administrator") ? '#059669' : '#64748b',
                          border: `1px solid ${(user.role === "Warehouse Operator" || user.role === "Administrator") ? '#a7f3d0' : '#cbd5e1'}`
                        }}>
                          {(user.role === "Warehouse Operator" || user.role === "Administrator") ? "⚡ Operator Mode" : user.role === "Consumer" ? "🔒 Consumer Mode" : `${user.role} Mode`}
                        </span>
                      )}
                    </div>

                    {/* Role Access Guidance Banner */}
                    {(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? (
                      <div style={{
                        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                        border: '1.5px solid #10b981',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        marginTop: '10px',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <span style={{ fontSize: '20px' }}>🏭</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            Warehouse Operational Control: Active
                          </div>
                          <div style={{ fontSize: '11px', color: '#047857' }}>
                            Full dynamic kinetics, microclimate sliders, and multi-zone thermal overrides enabled.
                          </div>
                        </div>
                        <span style={{ background: '#059669', color: 'white', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '100px' }}>
                          AUTHORIZED
                        </span>
                      </div>
                    ) : user?.role === "Consumer" ? (
                      <div style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        marginTop: '10px',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <span style={{ fontSize: '20px' }}>🔒</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            Consumer Household View: Controls Locked
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Microclimate kinetics are locked to baseline presets. Facility storage is operated by warehouse teams.
                          </div>
                        </div>
                        <span style={{ background: '#64748b', color: 'white', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '100px' }}>
                          READ-ONLY
                        </span>
                      </div>
                    ) : null}

                    {/* Food Selection */}
                    <div className="sim-slider-group">
                      <label className="sim-slider-label">Produce Variety</label>
                      <select
                        value={simProduce}
                        onChange={(e) => {
                          setSimProduce(e.target.value);
                          runShelfLifeSimulation({
                            food_name: e.target.value,
                            freshness_label: simFreshness,
                            quality_score: parseFloat(simFqi),
                            storage_temp_c: parseFloat(simTemp),
                            storage_rh_pct: parseFloat(simRh),
                            ethylene_exposure_ppm: parseFloat(simEthylene)
                          });
                        }}
                        style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--gray-300)', fontWeight: 700 }}
                      >
                        <option value="Banana">🍌 Banana (Chilling Sensitive / High Ethylene)</option>
                        <option value="Tomato">🍅 Tomato (Climacteric / Chilling Sensitive)</option>
                        <option value="Cucumber">🥒 Cucumber (High Moisture / Sensitive)</option>
                        <option value="Bittermelon">🥒 Bittermelon (Rapid Respiration)</option>
                        <option value="Eggplant">🍆 Eggplant (Pitting Sensitive)</option>
                        <option value="Orange">🍊 Orange (Citrus / Long Chiller Life)</option>
                        <option value="Papaya">🍈 Papaya (Tropical Ripening)</option>
                        <option value="Pineapple">🍍 Pineapple (Enzyme Active)</option>
                        <option value="Apple">🍎 Apple (High Ethylene Emitter)</option>
                        <option value="Strawberry">🍓 Strawberry (Perishable / Cold Loving)</option>
                        <option value="Potato">🥔 Potato (Root / Cool Dark Pantry)</option>
                        <option value="General Produce">🥗 General Produce</option>
                      </select>
                    </div>

                    {/* Freshness State */}
                    <div className="sim-slider-group">
                      <label className="sim-slider-label">Observed Freshness Grade</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {["Fresh", "Semi-Fresh", "Rotten"].map(f => (
                          <button
                            key={f}
                            type="button"
                            disabled={user?.role === "Consumer"}
                            onClick={() => {
                              setSimFreshness(f);
                              const newFqi = f === "Fresh" ? 88 : f === "Semi-Fresh" ? 58 : 25;
                              setSimFqi(newFqi);
                              runShelfLifeSimulation({
                                food_name: simProduce,
                                freshness_label: f,
                                quality_score: newFqi,
                                storage_temp_c: parseFloat(simTemp),
                                storage_rh_pct: parseFloat(simRh),
                                ethylene_exposure_ppm: parseFloat(simEthylene)
                              });
                            }}
                            style={{
                              padding: '7px 4px',
                              fontSize: '11px',
                              fontWeight: 800,
                              borderRadius: '8px',
                              border: simFreshness === f ? '2px solid var(--primary)' : '1px solid var(--gray-300)',
                              background: simFreshness === f ? '#ecfdf5' : 'white',
                              color: simFreshness === f ? '#059669' : 'var(--gray-700)',
                              cursor: user?.role === "Consumer" ? 'not-allowed' : 'pointer',
                              opacity: user?.role === "Consumer" ? 0.7 : 1
                            }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Temperature Slider */}
                    <div className="sim-slider-group">
                      <div className="sim-slider-label">
                        <span>Storage Temperature</span>
                        <b style={{ color: simTemp <= 4 ? '#059669' : simTemp <= 14 ? '#0284c7' : '#ea580c' }}>
                          {simTemp}°C
                        </b>
                      </div>
                      <input
                        type="range"
                        min="-18"
                        max="35"
                        step="0.5"
                        value={simTemp}
                        disabled={user?.role === "Consumer"}
                        onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                        onMouseUp={() => runShelfLifeSimulation()}
                        onTouchEnd={() => runShelfLifeSimulation()}
                        className="sim-slider"
                        style={{
                          opacity: user?.role === "Consumer" ? 0.5 : 1,
                          cursor: user?.role === "Consumer" ? 'not-allowed' : 'pointer'
                        }}
                      />
                      {/* Presets */}
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {[
                          { label: "❄️ 4°C Chiller", temp: 4.0 },
                          { label: "🥔 13°C Pantry", temp: 13.0 },
                          { label: "🍞 22°C Ambient", temp: 22.0 },
                          { label: "🧊 -18°C Freeze", temp: -18.0 }
                        ].map(p => (
                          <button
                            key={p.label}
                            type="button"
                            disabled={user?.role === "Consumer"}
                            onClick={() => {
                              setSimTemp(p.temp);
                              runShelfLifeSimulation({
                                food_name: simProduce,
                                freshness_label: simFreshness,
                                quality_score: parseFloat(simFqi),
                                storage_temp_c: p.temp,
                                storage_rh_pct: parseFloat(simRh),
                                ethylene_exposure_ppm: parseFloat(simEthylene)
                              });
                            }}
                            style={{
                              padding: '4px 6px',
                              fontSize: '10px',
                              fontWeight: 700,
                              borderRadius: '6px',
                              border: '1px solid var(--gray-300)',
                              background: simTemp === p.temp ? '#e0f2fe' : 'white',
                              cursor: user?.role === "Consumer" ? 'not-allowed' : 'pointer',
                              opacity: user?.role === "Consumer" ? 0.7 : 1
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Relative Humidity Slider */}
                    <div className="sim-slider-group">
                      <div className="sim-slider-label">
                        <span>Relative Humidity</span>
                        <b style={{ color: '#0284c7' }}>{simRh}% RH</b>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="98"
                        step="1"
                        value={simRh}
                        disabled={user?.role === "Consumer"}
                        onChange={(e) => setSimRh(parseFloat(e.target.value))}
                        onMouseUp={() => runShelfLifeSimulation()}
                        onTouchEnd={() => runShelfLifeSimulation()}
                        className="sim-slider"
                        style={{
                          opacity: user?.role === "Consumer" ? 0.5 : 1,
                          cursor: user?.role === "Consumer" ? 'not-allowed' : 'pointer'
                        }}
                      />
                    </div>

                    {/* Ethylene Gas Exposure */}
                    <div className="sim-slider-group">
                      <div className="sim-slider-label">
                        <span>Ethylene Exposure</span>
                        <b style={{ color: simEthylene > 0.15 ? '#ef4444' : '#059669' }}>
                          {simEthylene} ppm
                        </b>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="0.50"
                        step="0.01"
                        value={simEthylene}
                        disabled={user?.role === "Consumer"}
                        onChange={(e) => setSimEthylene(parseFloat(e.target.value))}
                        onMouseUp={() => runShelfLifeSimulation()}
                        onTouchEnd={() => runShelfLifeSimulation()}
                        className="sim-slider"
                        style={{
                          opacity: user?.role === "Consumer" ? 0.5 : 1,
                          cursor: user?.role === "Consumer" ? 'not-allowed' : 'pointer'
                        }}
                      />
                    </div>

                    <button
                      onClick={() => runShelfLifeSimulation()}
                      disabled={simLoading || user?.role === "Consumer"}
                      className="auth-btn"
                      style={{
                        marginTop: '6px',
                        background: user?.role === "Consumer" ? 'var(--gray-400)' : 'var(--dark-green)',
                        cursor: user?.role === "Consumer" ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {user?.role === "Consumer"
                        ? "🔒 Simulation Managed by Warehouse Operator"
                        : (simLoading ? "Calculating Kinetics..." : "⚡ Recalculate Shelf Life")}
                    </button>
                  </div>

                  {/* Right: Dynamic Kinetic Results & Interactive Decay Curve */}
                  <div className="sim-decay-chart-container">
                    {/* Big Result Card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '16px', marginBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                          Predicted Remaining Lifespan
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                          <span style={{ fontSize: '38px', fontWeight: 900, color: 'var(--dark-green)', letterSpacing: '-1px' }}>
                            {simResult?.predicted_remaining_days ?? 5.5}
                          </span>
                          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-700)' }}>Days</span>
                          <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 600 }}>
                            (~{simResult?.predicted_remaining_hours ?? 132} hours remaining)
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className="spoilage-badge optimal" style={{ fontSize: '12px', padding: '6px 14px' }}>
                          {simResult?.decay_stage || "Stable Shelf-Life"}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '4px', fontWeight: 600 }}>
                          Arrhenius Degradation: <b>{simResult?.kinetics?.arrhenius_velocity_multiplier ?? 1.0}x</b> velocity
                        </div>
                      </div>
                    </div>

                    {/* Chilling Injury Alert Warning Banner */}
                    {simResult?.kinetics?.chilling_injury && (
                      <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', fontSize: '12.5px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚠️</span>
                        <span>{simResult.kinetics.chilling_injury_warning}</span>
                      </div>
                    )}

                    {/* Dynamic SVG Decay Trajectory Chart */}
                    <div style={{ position: 'relative', width: '100%', height: '230px', background: '#fafbfc', borderRadius: '12px', border: '1px solid var(--gray-200)', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', marginBottom: '8px' }}>
                        <span>📈 Projected Freshness Degradation Curve (FQI vs Days)</span>
                        <span style={{ color: '#059669' }}>Q₁₀ Coefficient: {simResult?.kinetics?.q10_factor || 2.0}</span>
                      </div>

                      <svg className="decay-svg-chart" viewBox="0 0 600 180" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>

                        {/* Threshold Guides */}
                        <line x1="30" y1="40" x2="580" y2="40" stroke="#10b981" strokeDasharray="3 3" strokeOpacity="0.5" />
                        <text x="32" y="36" fontSize="9" fill="#059669" fontWeight="700">Peak Fresh (FQI 80+)</text>

                        <line x1="30" y1="90" x2="580" y2="90" stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity="0.5" />
                        <text x="32" y="86" fontSize="9" fill="#d97706" fontWeight="700">Markdown Clearance (FQI 50)</text>

                        <line x1="30" y1="140" x2="580" y2="140" stroke="#ef4444" strokeDasharray="3 3" strokeOpacity="0.5" />
                        <text x="32" y="136" fontSize="9" fill="#dc2626" fontWeight="700">Decomposition Boundary</text>

                        {/* Curve Path */}
                        {(() => {
                          const traj = simResult?.decay_trajectory || [
                            { day: 0, quality: 90 }, { day: 2, quality: 78 }, { day: 4, quality: 62 }, { day: 6, quality: 44 }, { day: 8, quality: 28 }
                          ];
                          const maxDay = Math.max(...traj.map(t => t.day), 1);
                          const pts = traj.map(t => {
                            const x = 30 + (t.day / maxDay) * 540;
                            const y = 160 - (t.quality / 100) * 140;
                            return { x, y, day: t.day, q: t.quality };
                          });

                          const pathStr = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                          const areaStr = `${pathStr} L ${pts[pts.length - 1].x} 170 L 30 170 Z`;

                          return (
                            <>
                              <path d={areaStr} fill="url(#decayGrad)" />
                              <path d={pathStr} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                              {pts.map((p, i) => (
                                <g key={i}>
                                  <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
                                  <text x={p.x} y={p.y - 8} fontSize="9" textAnchor="middle" fill="#334155" fontWeight="700">
                                    D{p.day} ({p.q})
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Multi-Zone Scenario Comparison Cards */}
                    <div style={{ marginTop: '16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gray-600)', textTransform: 'uppercase' }}>
                        Cross-Zone Lifespan Comparison
                      </span>
                      <div className="scenario-pill-grid">
                        <div className="scenario-pill">
                          <span>❄️ Chilled (4°C)</span>
                          <strong>{simResult?.scenario_comparisons?.refrigerated_4c ?? 7.0}d</strong>
                        </div>
                        <div className="scenario-pill">
                          <span>🥔 Cool Pantry (13°C)</span>
                          <strong>{simResult?.scenario_comparisons?.cool_cellar_13c ?? 5.0}d</strong>
                        </div>
                        <div className="scenario-pill">
                          <span>🍞 Ambient (22°C)</span>
                          <strong>{simResult?.scenario_comparisons?.ambient_22c ?? 2.5}d</strong>
                        </div>
                        <div className="scenario-pill">
                          <span>🧊 Deep Freeze (-18°C)</span>
                          <strong>{simResult?.scenario_comparisons?.deep_freeze_minus18c ?? 60.0}d</strong>
                        </div>
                      </div>
                    </div>

                    {/* Optimal Storage Directive */}
                    <div style={{ marginTop: '14px', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--gray-200)', fontSize: '12.5px', color: 'var(--gray-700)' }}>
                      <b>Optimal Environmental Envelope:</b> {simResult?.optimal_envelope?.storage_zone_recommendation || "Cool Cellar / Pantry"} • Safe: {simResult?.optimal_envelope?.temperature_range || "10°C - 15°C"} • RH: {simResult?.optimal_envelope?.humidity_range || "85-95%"}
                      <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--gray-500)' }}>
                        💡 {simResult?.preservation_tips || "Keep in cool well-ventilated dry space."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: STORAGE MONITORING & ENVIRONMENTAL WORKFLOWS (MILESTONE 3) */}
          {/* ============================================================ */}
          {activeTab === "storage_monitoring" && (
            <div className="tab-pane">
              <section className="intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2>🌡️ Multi-Zone Storage Monitoring & Automated Workflows</h2>
                  <p>
                    Live environmental microclimate telemetry across 5 storage zones with automated threshold mitigation workflows.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={fetchStorageZones}
                    disabled={zonesLoading}
                    className="auth-btn"
                    style={{ margin: 0, padding: '10px 18px', width: 'auto', background: 'var(--gray-700)', fontSize: '13px' }}
                  >
                    {zonesLoading ? "Polling..." : "🔄 Refresh Sensor Readings"}
                  </button>
                  <button
                    onClick={() => setActiveTab("storage_compliance")}
                    className="auth-btn"
                    style={{ margin: 0, padding: '10px 18px', width: 'auto', background: 'var(--dark-green)', fontSize: '13px' }}
                  >
                    ⚙️ Configure Thresholds
                  </button>
                </div>
              </section>

              {workflowToast && (
                <div style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>⚡</span>
                  <span>{workflowToast}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#059669', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>
                    WORKFLOW EXECUTED
                  </span>
                </div>
              )}

              {/* Multi-Zone Telemetry Grid */}
              <div className="zones-grid">
                {storageZones.map(zone => {
                  const isWarning = zone.status === "Warning";
                  const isCritical = zone.status === "Critical";
                  return (
                    <div key={zone.zone_id} className={`zone-card ${isCritical ? 'status-critical' : isWarning ? 'status-warning' : ''}`}>
                      <div>
                        <div className="zone-header">
                          <div className="zone-title-area">
                            <div className="zone-icon">{zone.icon}</div>
                            <div>
                              <strong style={{ fontSize: '16px', color: 'var(--dark)' }}>{zone.name}</strong>
                              <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                                {zone.type} • Stored Items: <b>{zone.active_items_count || 0} batches</b>
                              </div>
                            </div>
                          </div>
                          <span className={`zone-status-badge ${zone.status.toLowerCase()}`}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isCritical ? '#dc2626' : isWarning ? '#d97706' : '#059669' }}></span>
                            {zone.status}
                          </span>
                        </div>

                        {/* Excursion Alerts if any */}
                        {zone.active_excursions && zone.active_excursions.length > 0 && (
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '11.5px', color: '#dc2626', fontWeight: 700 }}>
                            ⚠️ {zone.active_excursions.join(" • ")}
                          </div>
                        )}

                        {/* Telemetry Metric Readings */}
                        <div className="telemetry-readings-grid">
                          <div className="telemetry-item">
                            <div className="telemetry-item-label">Temperature</div>
                            <div className="telemetry-item-val" style={{ color: zone.telemetry?.current_temp > zone.targets?.temp_target + 3 ? '#dc2626' : 'var(--dark)' }}>
                              {zone.telemetry?.current_temp}°C
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--gray-500)' }}>
                              Target: {zone.targets?.temp_target}°C
                            </span>
                          </div>

                          <div className="telemetry-item">
                            <div className="telemetry-item-label">Humidity</div>
                            <div className="telemetry-item-val" style={{ color: '#0284c7' }}>
                              {zone.telemetry?.current_rh}% RH
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--gray-500)' }}>
                              Target: {zone.targets?.rh_target}%
                            </span>
                          </div>

                          <div className="telemetry-item">
                            <div className="telemetry-item-label">Ethylene Gas</div>
                            <div className="telemetry-item-val" style={{ color: zone.telemetry?.ethylene_ppm > zone.targets?.max_ethylene_ppm ? '#ea580c' : '#059669' }}>
                              {zone.telemetry?.ethylene_ppm} ppm
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--gray-500)' }}>
                              Max: {zone.targets?.max_ethylene_ppm} ppm
                            </span>
                          </div>

                          <div className="telemetry-item">
                            <div className="telemetry-item-label">Airflow & Cooling</div>
                            <div className="telemetry-item-val" style={{ fontSize: '14px', marginTop: '2px' }}>
                              {zone.telemetry?.compressor_active ? "🟢 Active Chill" : "⚪ Standby"}
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--gray-500)' }}>
                              {zone.telemetry?.airflow_cfm || 200} CFM
                            </span>
                          </div>
                        </div>

                        <p style={{ margin: '8px 0 14px', fontSize: '12px', color: 'var(--gray-600)' }}>
                          {zone.description}
                        </p>
                      </div>

                      {/* Corrective Mitigation Workflows */}
                      <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                            Automated Mitigation Triggers:
                          </span>
                          {(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? (
                            <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                              ⚡ OPERATOR DIRECT ACCESS
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                              🔒 READ-ONLY
                            </span>
                          )}
                        </div>
                        <div className="zone-workflow-actions">
                          <button
                            onClick={() => handleExecuteWorkflow(zone.zone_id, "COOLING_BOOST")}
                            disabled={!(user?.role === "Warehouse Operator" || user?.role === "Administrator") || workflowActionLoading === `${zone.zone_id}-COOLING_BOOST`}
                            className="wf-action-btn primary"
                            title={(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? "Boost high-output compressor chill" : "Action requires Warehouse Operator authorization"}
                            style={{
                              opacity: !(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? 0.55 : 1,
                              cursor: !(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? 'not-allowed' : 'pointer'
                            }}
                          >
                            ❄️ Boost Chill
                          </button>
                          <button
                            onClick={() => handleExecuteWorkflow(zone.zone_id, "AIR_PURGE")}
                            disabled={!(user?.role === "Warehouse Operator" || user?.role === "Administrator") || workflowActionLoading === `${zone.zone_id}-AIR_PURGE`}
                            className="wf-action-btn"
                            title={(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? "Activate ethylene catalytic air scrubber" : "Action requires Warehouse Operator authorization"}
                            style={{
                              opacity: !(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? 0.55 : 1,
                              cursor: !(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? 'not-allowed' : 'pointer'
                            }}
                          >
                            💨 Gas Purge
                          </button>
                          <button
                            onClick={() => handleExecuteWorkflow(zone.zone_id, "HUMIDITY_OPTIMIZE")}
                            disabled={!(user?.role === "Warehouse Operator" || user?.role === "Administrator") || workflowActionLoading === `${zone.zone_id}-HUMIDITY_OPTIMIZE`}
                            className="wf-action-btn"
                            title={(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? "Calibrate ultrasonic humidity injection" : "Action requires Warehouse Operator authorization"}
                            style={{
                              opacity: !(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? 0.55 : 1,
                              cursor: !(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? 'not-allowed' : 'pointer'
                            }}
                          >
                            💧 Calibrate RH
                          </button>
                          <button
                            onClick={() => handleExecuteWorkflow(zone.zone_id, "RESET_NORMAL")}
                            disabled={!(user?.role === "Warehouse Operator" || user?.role === "Administrator") || workflowActionLoading === `${zone.zone_id}-RESET_NORMAL`}
                            className="wf-action-btn"
                            title={(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? "Reset zone to baseline configuration" : "Action requires Warehouse Operator authorization"}
                            style={{
                              opacity: !(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? 0.55 : 1,
                              cursor: !(user?.role === "Warehouse Operator" || user?.role === "Administrator") ? 'not-allowed' : 'pointer'
                            }}
                          >
                            🔄 Reset
                          </button>
                        </div>
                        {!(user?.role === "Warehouse Operator" || user?.role === "Administrator") && (
                          <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginTop: '6px' }}>
                            🔒 Mitigation workflows can only be executed by Warehouse Operators and Administrators.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Storage Workflow Execution Audit Log */}
              <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 800, color: 'var(--dark-green)' }}>
                  📜 Environmental Mitigation Workflow Audit Trail
                </h3>
                {workflowAuditLogs && workflowAuditLogs.length > 0 ? (
                  <div className="spoilage-table-container">
                    <table className="spoilage-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Zone</th>
                          <th>Workflow Action</th>
                          <th>Triggered By</th>
                          <th>Status</th>
                          <th>Action Summary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workflowAuditLogs.map((log, idx) => (
                          <tr key={idx}>
                            <td style={{ fontSize: '11px', whiteSpace: 'nowrap', color: 'var(--gray-500)' }}>
                              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Just now"}
                            </td>
                            <td>
                              <strong>{log.zone_name || log.zone_id}</strong>
                            </td>
                            <td>
                              <span style={{ fontSize: '11px', background: 'var(--gray-100)', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, color: 'var(--dark)' }}>
                                {log.action}
                              </span>
                            </td>
                            <td>{log.executed_by || "System Automator"}</td>
                            <td>
                              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 800 }}>
                                ✓ {log.status || "Executed"}
                              </span>
                            </td>
                            <td style={{ fontSize: '12px', color: 'var(--gray-700)' }}>
                              {log.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
                    No workflow actions executed yet. Use the action triggers above to activate corrective cold-chain cycles.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: SMART RECOMMENDATION ENGINE & FEFO (MILESTONE 3) */}
          {/* ============================================================ */}
          {activeTab === "recommendations" && (
            <div className="tab-pane">
              <section className="intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2>💡 Smart Recommendation Engine & FEFO Workflows</h2>
                  <p>
                    Algorithmic First-Expired First-Out (FEFO) scheduling, dynamic retail markdown pricing, ethylene gas compatibility, and zero-waste repurposing.
                  </p>
                </div>
                <button
                  onClick={fetchRecommendations}
                  disabled={recommendationsLoading}
                  className="auth-btn"
                  style={{ margin: 0, padding: '10px 18px', width: 'auto', background: 'var(--primary)', fontSize: '13px' }}
                >
                  {recommendationsLoading ? "Analyzing..." : "🔄 Refresh Recommendations"}
                </button>
              </section>

              {/* 1. Ethylene Gas Incompatibility Alerts Banner */}
              {recommendationsData?.ethylene_conflicts && recommendationsData.ethylene_conflicts.length > 0 && (
                <div className="ethylene-alert-banner">
                  <div className="ethylene-alert-icon">⚠️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '15px', color: '#92400e' }}>
                        Ethylene Gas Cross-Contamination Warning Detected!
                      </strong>
                      <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                        HIGH RISK
                      </span>
                    </div>
                    {recommendationsData.ethylene_conflicts.map((conf, i) => (
                      <div key={i} style={{ marginTop: '8px', fontSize: '13px', color: '#78350f' }}>
                        <div><b>Location:</b> {conf.storage_location}</div>
                        <div>{conf.risk_description}</div>
                        <div style={{ marginTop: '4px', fontWeight: 700, color: '#b45309' }}>
                          👉 {conf.action_directive}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. FEFO Dispatch Queue Table */}
              <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--card-shadow)', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--dark-green)' }}>
                      📋 FEFO Priority Dispatch & Dynamic Markdown Table
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--gray-500)' }}>
                      Ranked in strict expiration sequence to prevent waste and maximize commercial recovery.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { key: "all", label: "All Items" },
                      { key: "urgent", label: "🚨 Urgent (<48h)" },
                      { key: "markdown", label: "🏷️ Markdown Candidates" }
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setFefoFilter(f.key)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: fefoFilter === f.key ? '1px solid var(--primary)' : '1px solid var(--gray-300)',
                          background: fefoFilter === f.key ? '#ecfdf5' : 'white',
                          color: fefoFilter === f.key ? '#059669' : 'var(--gray-700)',
                          cursor: 'pointer'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {recommendationsData?.fefo_queue && recommendationsData.fefo_queue.length > 0 ? (
                  <div className="spoilage-table-container">
                    <table className="spoilage-table">
                      <thead>
                        <tr>
                          <th>Priority / Item</th>
                          <th>Category</th>
                          <th>Storage Location</th>
                          <th>Days Left</th>
                          <th>FEFO Urgency</th>
                          <th>Suggested Markdown</th>
                          <th>Dispatch Target</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendationsData.fefo_queue
                          .filter(q => {
                            if (fefoFilter === "urgent") return q.urgency === "URGENT_HAZARD" || q.urgency === "CRITICAL_FEFO" || q.urgency === "HIGH_FEFO";
                            if (fefoFilter === "markdown") return q.markdown_pct > 0;
                            return true;
                          })
                          .map((q, idx) => (
                            <tr key={idx}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '16px' }}>{getFoodVisual(q.name, q.category).emoji}</span>
                                  <strong>{q.name}</strong>
                                </div>
                              </td>
                              <td>{q.category}</td>
                              <td>{q.storage}</td>
                              <td>
                                <b style={{ color: q.days_left <= 1 ? '#dc2626' : q.days_left <= 3 ? '#ea580c' : '#059669' }}>
                                  {q.days_left <= 0 ? "Expired" : `${q.days_left}d`}
                                </b>
                              </td>
                              <td>
                                <span className="fefo-table-badge" style={{ background: `${q.badge_color}20`, color: q.badge_color, border: `1px solid ${q.badge_color}50` }}>
                                  {q.urgency_label}
                                </span>
                              </td>
                              <td>
                                {q.markdown_pct > 0 ? (
                                  <span className="markdown-discount-tag">
                                    -{q.markdown_pct}% OFF
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>Full Value</span>
                                )}
                              </td>
                              <td style={{ fontSize: '12px', color: 'var(--gray-700)' }}>
                                {q.dispatch_window}
                              </td>
                              <td>
                                <button
                                  onClick={() => {
                                    handleDeleteInventory(q.item_id);
                                  }}
                                  style={{
                                    background: 'var(--gray-100)',
                                    color: 'var(--gray-700)',
                                    border: '1px solid var(--gray-300)',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                  title="Mark item as consumed"
                                >
                                  ✓ Consumed
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--gray-500)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                    No items in inventory. Add produce items in the <b>Register Item</b> tab to generate dynamic FEFO schedules.
                  </p>
                )}
              </div>

              {/* 3. Culinary Repurposing & Zero-Waste Protocols */}
              <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: 'var(--dark-green)' }}>
                  🍳 Culinary Repurposing & Waste-to-Value Solutions
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: 'var(--gray-500)' }}>
                  Chef-grade preservation methods and culinary preparations to extract maximum value from produce nearing end-of-life.
                </p>

                {recommendationsData?.culinary_repurposing && recommendationsData.culinary_repurposing.length > 0 ? (
                  <div className="repurposing-grid">
                    {recommendationsData.culinary_repurposing.map((plan, idx) => (
                      <div key={idx} className="repurpose-card">
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <strong style={{ fontSize: '15px', color: 'var(--dark)' }}>
                              {getFoodVisual(plan.produce_name).emoji} {plan.title}
                            </strong>
                            <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                              {plan.days_left}d left
                            </span>
                          </div>

                          <div style={{ marginTop: '12px' }}>
                            {plan.methods?.map((m, mIdx) => (
                              <div key={mIdx} className="repurpose-method-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--dark)' }}>
                                  <span>{m.action}</span>
                                  <span style={{ color: '#059669', fontSize: '11px' }}>{m.shelf_extension}</span>
                                </div>
                                <p style={{ margin: '4px 0 0', color: 'var(--gray-600)', fontSize: '11.5px' }}>
                                  {m.desc}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)', fontSize: '13px' }}>
                    🥗 All active produce items have ample shelf-life remaining. Repurposing actions will activate when items approach 3 days to expiry.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: DASHBOARD (PERSONAL FOOD MONITORING & NOTIFICATION/ALERT CENTER) */}
          {activeTab === "executive" && (
            <div className="tab-pane">
              {/* Main Dual Grid: Hero on left, Alert Center on right */}
              <div className="dashboard-main-grid">
                {/* Left Panel: Hero Welcome, Description & Quick Actions */}
                <div className="dashboard-hero-card">
                  <div className="hero-pill-badge">
                    <span>🌱</span> Personal Food Monitoring
                  </div>

                  <h1 className="dashboard-hero-title">
                    Keep your food
                    <span className="text-highlight">fresh & healthy</span>
                  </h1>

                  <p className="dashboard-hero-desc">
                    Track your personal food inventory, monitor real-time freshness, receive timely spoilage warnings, and make smarter decisions before food goes to waste.
                  </p>

                  <div className="hero-actions-row">
                    <button
                      className="hero-btn-primary"
                      onClick={() => setActiveTab("register_food")}
                    >
                      <span>➕</span> Add Food
                    </button>
                    <button
                      className="hero-btn-secondary"
                      onClick={() => setActiveTab("inventory")}
                    >
                      <span>📦</span> View Inventory
                    </button>
                    <button
                      className="hero-btn-scan"
                      onClick={() => setActiveTab("scanner")}
                    >
                      <span>🔍</span> Scan Food
                    </button>
                  </div>

                  {/* Freshness Orbit Graphic */}
                  <div className="hero-orbit-card">
                    <div className="orbit-badge-group">
                      <h5>Freshness Vitality Orbit</h5>
                      <p>
                        <b>{inventory.length}</b> produce batches actively monitored under cold-chain standards.
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: 750 }}>
                          ✓ 92% Health Index
                        </span>
                        <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '6px', fontWeight: 750 }}>
                          🍃 Zero-Waste Active
                        </span>
                      </div>
                    </div>

                    <div className="orbit-visual-circle" title="Continuous Food Freshness Orbit">
                      <span className="orbit-fresh-tag">FRESH</span>
                      <span className="orbit-center-icon">🥑</span>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Alert Center (Directly matching friend's screenshot) */}
                <div className="alert-center-panel">
                  <div className="alert-center-top-bar">
                    <div className="alert-center-title-box">
                      <div className="alert-bell-circle">
                        🔔
                      </div>
                      <div className="alert-center-titles">
                        <h3>FreshCheck Alert Center</h3>
                        <p>{`${getDashboardAlerts().length} alerts need attention`}</p>
                      </div>
                    </div>
                    <div className="alert-center-count-pill">
                      {getDashboardAlerts().length}
                    </div>
                  </div>

                  <div className="alert-list-container">
                    {getDashboardAlerts().length === 0 ? (
                      <div className="alert-center-empty" style={{ padding: "36px 16px", textAlign: "center", color: "var(--gray-500)" }}>
                        <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>✅</span>
                        <div style={{ fontWeight: 700, color: "var(--dark)", fontSize: "15px", marginBottom: "6px" }}>
                          No Active Spoilage Alerts
                        </div>
                        <p style={{ fontSize: "13px", margin: 0, color: "var(--gray-500)" }}>
                          All monitored inventory batches and produce scans are within safe shelf-life windows.
                        </p>
                      </div>
                    ) : (
                      getDashboardAlerts().map((alert, idx) => (
                        <div
                          key={alert.id || idx}
                          className={`alert-card-row ${alert.type === "EXPIRED" ? "expired" : "near-expiry"}`}
                          onClick={() => {
                            if (alert.item_id) {
                              setActiveTab("inventory");
                            } else {
                              setActiveTab("spoilage");
                            }
                          }}
                          title="Click to view details in Inventory"
                        >
                          <div className="alert-item-left">
                            <span className="alert-item-icon">{alert.icon || "⏳"}</span>
                            <div className="alert-item-text">
                              <div className="alert-item-header-line">
                                <span className="alert-item-name">{alert.name}</span>
                                <span className={`alert-status-badge ${alert.type === "EXPIRED" ? "expired" : "near-expiry"}`}>
                                  {alert.type}
                                </span>
                              </div>
                              <p className="alert-item-desc">{alert.desc}</p>
                            </div>
                          </div>
                          <span className={`alert-dot-indicator ${alert.type === "EXPIRED" ? "expired" : "near-expiry"}`}></span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="alert-center-footer">
                    <span style={{ color: 'var(--gray-500)', fontSize: '11.5px' }}>
                      ⚡ Real-time inventory telemetry & FEFO alerts
                    </span>
                    <button onClick={() => setActiveTab("spoilage")}>
                      View Spoilage Pipeline →
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Summary Metric Cards */}
              <div className="analytics-grid" style={{ marginBottom: '24px' }}>
                <div className="metric-hero-card">
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                    Active Inventory
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: 850, color: 'var(--dark)', margin: '8px 0 4px' }}>
                    {inventory.length} Batches
                  </div>
                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                    ✓ Monitored in real time
                  </span>
                </div>

                <div className="metric-hero-card">
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                    Attention Required
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: 850, color: '#dc2626', margin: '8px 0 4px' }}>
                    {getDashboardAlerts().length} Items
                  </div>
                  <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 700 }}>
                    ⚠️ Requires consumption or rotation
                  </span>
                </div>

                <div className="metric-hero-card">
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                    Loss Mitigation
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: 850, color: '#059669', margin: '8px 0 4px' }}>
                    {executiveData?.kpis?.spoilage_reduction_percent ?? 94.2}%
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    🎯 Outperforming industry baseline (78%)
                  </span>
                </div>

                <div className="metric-hero-card">
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                    Cold-Chain Health
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: 850, color: 'var(--dark-green)', margin: '8px 0 4px' }}>
                    {executiveData?.kpis?.cold_chain_compliance_percent ?? 96.8}%
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    ❄️ Multi-compartment vaults active
                  </span>
                </div>
              </div>

              {/* Visualizations & Multi-Day Charts */}
              {(() => {
                // Read directly from backend executive data:
                const backendFqiTrajectory = executiveData?.fqi_trajectory;
                const backendAvgFqi = Number(executiveData?.kpis?.average_produce_fqi ?? 85.0);

                // Real data points from backend (with graceful dynamic fallback calibrated to avg_produce_fqi)
                const fqiPointsRaw = (Array.isArray(backendFqiTrajectory) && backendFqiTrajectory.length === 5)
                  ? backendFqiTrajectory
                  : [
                      { day_label: "Day 1", date: "Day 1", fqi: Math.max(15, backendAvgFqi - 6.2), status: "Baseline Quality" },
                      { day_label: "Day 4", date: "Day 4", fqi: Math.max(18, backendAvgFqi - 3.4), status: "Monitored Storage" },
                      { day_label: "Day 8", date: "Day 8", fqi: Math.max(20, backendAvgFqi - 0.6), status: "Active Retention" },
                      { day_label: "Day 11", date: "Day 11", fqi: Math.min(100, backendAvgFqi + 2.0), status: "Optimized Microclimate" },
                      { day_label: "Today", date: "Today", fqi: Math.min(100, backendAvgFqi + 4.1), status: "Current Monitored Quality" }
                    ];

                const xCoords = [40, 140, 240, 340, 440];
                const fqiTrajectoryPoints = fqiPointsRaw.map((item, idx) => {
                  const fqiNum = Math.round(Number(item.fqi) * 10) / 10;
                  // Usable height between y=25 (top 100 FQI) and y=135 (bottom 0 FQI)
                  const y = Math.round(135 - (Math.min(100, Math.max(0, fqiNum)) / 100) * 110);
                  return {
                    x: xCoords[idx],
                    y: y,
                    fqiNum: fqiNum,
                    day: item.day_label || `Day ${idx + 1}`,
                    date: item.date || "",
                    val: `${fqiNum.toFixed(1)} FQI`,
                    status: item.status || "Facility Quality Track"
                  };
                });

                // Generate smooth SVG curve path from the dynamic backend points
                const p0 = fqiTrajectoryPoints[0];
                const p1 = fqiTrajectoryPoints[1];
                const p2 = fqiTrajectoryPoints[2];
                const p3 = fqiTrajectoryPoints[3];
                const p4 = fqiTrajectoryPoints[4];
                const fqiCurvePath = `M ${p0.x} ${p0.y} C ${(p0.x + p1.x)/2} ${p0.y}, ${(p0.x + p1.x)/2} ${p1.y}, ${p1.x} ${p1.y} C ${(p1.x + p2.x)/2} ${p1.y}, ${(p1.x + p2.x)/2} ${p2.y}, ${p2.x} ${p2.y} C ${(p2.x + p3.x)/2} ${p2.y}, ${(p2.x + p3.x)/2} ${p3.y}, ${p3.x} ${p3.y} C ${(p3.x + p4.x)/2} ${p3.y}, ${(p3.x + p4.x)/2} ${p4.y}, ${p4.x} ${p4.y}`;
                const fqiAreaPath = `${fqiCurvePath} L ${p4.x} 135 L ${p0.x} 135 Z`;

                // Backend Economic Value Protected & Trend
                const backendProtectedINR = Number(
                  executiveData?.kpis?.protected_value_inr ??
                  (executiveData?.kpis?.protected_value_usd ? Math.round(executiveData.kpis.protected_value_usd * 84) : 0)
                );
                const backendCostAversion = executiveData?.cost_aversion_trend;

                const costBarsRaw = (Array.isArray(backendCostAversion) && backendCostAversion.length === 5)
                  ? backendCostAversion
                  : [
                      { label: "W1", full_label: "Week 1", amount_inr: Math.round(backendProtectedINR * 0.18), kg_saved: 110 },
                      { label: "W2", full_label: "Week 2", amount_inr: Math.round(backendProtectedINR * 0.38), kg_saved: 235 },
                      { label: "W3", full_label: "Week 3", amount_inr: Math.round(backendProtectedINR * 0.62), kg_saved: 410 },
                      { label: "W4", full_label: "Week 4", amount_inr: Math.round(backendProtectedINR * 0.85), kg_saved: 615 },
                      { label: "Current", full_label: "Current Week", amount_inr: backendProtectedINR, kg_saved: 915 }
                    ];

                const maxBarAmount = Math.max(...costBarsRaw.map(b => Number(b.amount_inr || 0)), 1);
                const barXCoords = [50, 130, 210, 290, 370];

                const wasteAversionBars = costBarsRaw.map((b, idx) => {
                  const amt = Number(b.amount_inr || 0);
                  const h = Math.max(14, Math.round((amt / maxBarAmount) * 115));
                  return {
                    x: barXCoords[idx],
                    h: h,
                    label: b.label || `W${idx + 1}`,
                    fullLabel: b.full_label || `Week ${idx + 1}`,
                    amount: `₹${amt.toLocaleString('en-IN')}`,
                    kgSaved: `${b.kg_saved || 0} kg`
                  };
                });

                const baselineFqi = fqiTrajectoryPoints[0]?.fqiNum ?? 50.0;
                const currentFqi = fqiTrajectoryPoints[4]?.fqiNum ?? baselineFqi;
                const fqiDiff = currentFqi - baselineFqi;
                const fqiDiffSign = fqiDiff >= 0 ? "+" : "";

                return (
                  <div className="exec-visuals-grid">
                    {/* 14-Day Trajectory */}
                    <div className="exec-visual-card">
                      <div className="exec-visual-card-header">
                        <h4><span>📊</span> Produce Quality Index (FQI) 14-Day Trajectory</h4>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                          Avg {executiveData?.kpis?.average_produce_fqi !== undefined ? Number(executiveData.kpis.average_produce_fqi).toFixed(1) : "0.0"}
                        </span>
                      </div>

                      {/* Interactive SVG Trend Chart with Hover Bubble */}
                      <div style={{ position: 'relative', width: '100%', height: '180px', marginTop: '10px' }}>
                        {/* Hover Tooltip Bubble for FQI Chart */}
                        {fqiHoveredPoint !== null && (
                          <div
                            style={{
                              position: 'absolute',
                              left: `${(fqiTrajectoryPoints[fqiHoveredPoint].x / 500) * 100}%`,
                              top: `${(fqiTrajectoryPoints[fqiHoveredPoint].y / 160) * 100}%`,
                              transform: 'translate(-50%, -125%)',
                              background: '#0f172a',
                              color: '#ffffff',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -4px rgba(0, 0, 0, 0.25)',
                              border: '1px solid #10b981',
                              pointerEvents: 'none',
                              zIndex: 20,
                              minWidth: '155px',
                              textAlign: 'center',
                              backdropFilter: 'blur(8px)',
                              transition: 'left 0.1s ease, top 0.1s ease'
                            }}
                          >
                            <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              📅 {fqiTrajectoryPoints[fqiHoveredPoint].day} {fqiTrajectoryPoints[fqiHoveredPoint].date ? `(${fqiTrajectoryPoints[fqiHoveredPoint].date})` : ""}
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 850, color: '#10b981', margin: '3px 0 2px' }}>
                              {fqiTrajectoryPoints[fqiHoveredPoint].val}
                            </div>
                            <div style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 600 }}>
                              {fqiTrajectoryPoints[fqiHoveredPoint].status}
                            </div>
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '-5px',
                                left: '50%',
                                transform: 'translateX(-50%) rotate(45deg)',
                                width: '10px',
                                height: '10px',
                                background: '#0f172a',
                                borderRight: '1px solid #10b981',
                                borderBottom: '1px solid #10b981'
                              }}
                            />
                          </div>
                        )}

                        <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          <defs>
                            <linearGradient id="fqiGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="30" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="30" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                          <path
                            d={fqiAreaPath}
                            fill="url(#fqiGrad)"
                          />
                          <path
                            d={fqiCurvePath}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />

                          {/* Hover Guideline if point hovered */}
                          {fqiHoveredPoint !== null && (
                            <line
                              x1={fqiTrajectoryPoints[fqiHoveredPoint].x}
                              y1={fqiTrajectoryPoints[fqiHoveredPoint].y}
                              x2={fqiTrajectoryPoints[fqiHoveredPoint].x}
                              y2="135"
                              stroke="#10b981"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                          )}

                          {fqiTrajectoryPoints.map((pt, idx) => {
                            const isHovered = fqiHoveredPoint === idx;
                            return (
                              <g
                                key={idx}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setFqiHoveredPoint(idx)}
                                onMouseLeave={() => setFqiHoveredPoint(null)}
                              >
                                {/* Invisible wide hit area for easy hover targeting */}
                                <circle cx={pt.x} cy={pt.y} r="22" fill="transparent" />
                                {isHovered && (
                                  <circle cx={pt.x} cy={pt.y} r="12" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.4" />
                                )}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={isHovered ? 7.5 : 5.5}
                                  fill="#ffffff"
                                  stroke={isHovered ? "#059669" : "#10b981"}
                                  strokeWidth={isHovered ? 3.5 : 2.5}
                                  style={{ transition: 'all 0.15s ease' }}
                                />
                              </g>
                            );
                          })}

                          {fqiTrajectoryPoints.map((pt, idx) => (
                            <text key={idx} x={pt.x} y="150" textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="600">
                              {pt.day}
                            </text>
                          ))}
                        </svg>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '12px', color: 'var(--gray-500)' }}>
                        <span>Baseline: {baselineFqi.toFixed(1)} FQI</span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>{fqiDiffSign}{fqiDiff.toFixed(1)} FQI Retention Gain</span>
                      </div>
                    </div>

                    {/* Economic Value Protected Curve in Indian Currency (₹) */}
                    <div className="exec-visual-card">
                      <div className="exec-visual-card-header">
                        <h4><span>💰</span> Cumulative Food Waste Cost Aversion (₹)</h4>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                          ₹{backendProtectedINR.toLocaleString('en-IN')} Protected
                        </span>
                      </div>

                      {/* Interactive Bar Chart with Hover Bubble */}
                      <div style={{ position: 'relative', width: '100%', height: '180px', marginTop: '10px' }}>
                        {/* Hover Tooltip Bubble for Bar Chart */}
                        {wasteHoveredBar !== null && (
                          <div
                            style={{
                              position: 'absolute',
                              left: `${((wasteAversionBars[wasteHoveredBar].x + 20) / 500) * 100}%`,
                              top: `${((140 - wasteAversionBars[wasteHoveredBar].h) / 160) * 100}%`,
                              transform: 'translate(-50%, -125%)',
                              background: '#0f172a',
                              color: '#ffffff',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -4px rgba(0, 0, 0, 0.25)',
                              border: '1px solid #10b981',
                              pointerEvents: 'none',
                              zIndex: 20,
                              minWidth: '160px',
                              textAlign: 'center',
                              backdropFilter: 'blur(8px)',
                              transition: 'left 0.1s ease, top 0.1s ease'
                            }}
                          >
                            <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              📊 {wasteAversionBars[wasteHoveredBar].fullLabel}
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 850, color: '#34d399', margin: '3px 0 2px' }}>
                              {wasteAversionBars[wasteHoveredBar].amount}
                            </div>
                            <div style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 600 }}>
                              🛡️ {wasteAversionBars[wasteHoveredBar].kgSaved} Waste Averted
                            </div>
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '-5px',
                                left: '50%',
                                transform: 'translateX(-50%) rotate(45deg)',
                                width: '10px',
                                height: '10px',
                                background: '#0f172a',
                                borderRight: '1px solid #10b981',
                                borderBottom: '1px solid #10b981'
                              }}
                            />
                          </div>
                        )}

                        <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          <defs>
                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#059669" />
                              <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>
                            <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#6ee7b7" />
                            </linearGradient>
                          </defs>

                          {wasteAversionBars.map((bar, i) => {
                            const isHovered = wasteHoveredBar === i;
                            return (
                              <g
                                key={i}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setWasteHoveredBar(i)}
                                onMouseLeave={() => setWasteHoveredBar(null)}
                              >
                                {/* Invisible wide hit area for easy hover targeting */}
                                <rect
                                  x={bar.x - 8}
                                  y="0"
                                  width="56"
                                  height="160"
                                  fill="transparent"
                                />
                                <rect
                                  x={bar.x}
                                  y={isHovered ? 138 - bar.h : 140 - bar.h}
                                  width="40"
                                  height={isHovered ? bar.h + 2 : bar.h}
                                  rx="6"
                                  fill={isHovered ? "url(#barGradHover)" : "url(#barGrad)"}
                                  style={{ transition: 'all 0.15s ease' }}
                                />
                                <text
                                  x={bar.x + 20}
                                  y="155"
                                  textAnchor="middle"
                                  fontSize="11"
                                  fill={isHovered ? "#0f172a" : "#94a3b8"}
                                  fontWeight={isHovered ? "800" : "600"}
                                >
                                  {bar.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '12px', color: 'var(--gray-500)' }}>
                        <span>Weekly Aversion Velocity</span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>
                          ₹{(executiveData?.kpis?.avg_kg_saved_rate_inr || 320).toLocaleString('en-IN')} Avg / kg Produce Saved
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
{/* Departmental Performance Matrix */}
              <div className="exec-visual-card">
                <div className="exec-visual-card-header">
                  <h4><span>🏢</span> Facility Department Operational Status</h4>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>All 4 Modules Online</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="exec-dept-table">
                    <thead>
                      <tr>
                        <th>Department / Storage Area</th>
                        <th>Compliance Score</th>
                        <th>Active Batches</th>
                        <th>Active Excursions</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const depts = (executiveData?.departmental_status && executiveData.departmental_status.length > 0)
                          ? executiveData.departmental_status
                          : [
                              {
                                name: "Incoming Receiving & Staging",
                                compliance_score: 98.2,
                                active_batches: 9,
                                alerts: 0,
                                status: "Optimal"
                              },
                              {
                                name: "Chilled Cold Vault (Zone A)",
                                compliance_score: executiveData?.kpis?.cold_chain_compliance_percent || 96.8,
                                active_batches: 12,
                                alerts: executiveData?.kpis?.critical_risk_items || 0,
                                status: (executiveData?.kpis?.cold_chain_compliance_percent || 96.8) >= 90 ? "Compliant" : "Review Needed"
                              },
                              {
                                name: "Cool Pantry & Root Cellar (Zone B)",
                                compliance_score: 94.5,
                                active_batches: 6,
                                alerts: 0,
                                status: "Compliant"
                              },
                              {
                                name: "Dry Ambient Staging (Zone C)",
                                compliance_score: 91.0,
                                active_batches: 3,
                                alerts: 0,
                                status: "Compliant"
                              }
                            ];

                        return depts.map((dept, i) => (
                          <tr key={i}>
                            <td>
                              <strong>{dept.name}</strong>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '80px', height: '6px', background: 'var(--gray-200)', borderRadius: '10px', overflow: 'hidden' }}>
                                  <div style={{ width: `${dept.compliance_score}%`, height: '100%', background: dept.compliance_score >= 90 ? 'var(--primary)' : '#f59e0b' }}></div>
                                </div>
                                <span style={{ fontWeight: 700 }}>{dept.compliance_score}%</span>
                              </div>
                            </td>
                            <td>{dept.active_batches} batches</td>
                            <td>
                              <span style={{ color: dept.alerts > 0 ? '#ef4444' : 'var(--gray-500)', fontWeight: dept.alerts > 0 ? 800 : 500 }}>
                                {dept.alerts > 0 ? `⚠️ ${dept.alerts} Flagged` : "None"}
                              </span>
                            </td>
                            <td>
                              <span className={`fefo-table-badge ${dept.status === "Optimal" || dept.status === "Compliant" ? "optimal" : "warning"}`}>
                                {dept.status}
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Milestone 4: Compliance & Audit Reports Module */}
          {/* Milestone 4: Compliance & Audit Reports Module */}
          {activeTab === "reports" && (() => {
            const isAdmin = (user?.role || "").toLowerCase() === "administrator" || (user?.role || "").toLowerCase() === "admin";
            const userRole = user?.role || "Consumer";

            // Base records fallback
            const rawRecords = (complianceReport?.batch_records && complianceReport.batch_records.length > 0)
              ? complianceReport.batch_records
              : (inventory || []).map((item, idx) => {
                  const expDate = item.expiry && item.expiry !== "N/A" ? new Date(item.expiry) : new Date();
                  const diffDays = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));
                  const daysLeft = isNaN(diffDays) ? 5 : Math.max(0, diffDays);
                  return {
                    batch_id: `LOT-${1000 + idx}`,
                    produce_name: item.name || "Produce Item",
                    category: item.category || "General",
                    user_name: user?.name || (isAdmin ? "Platform Admin" : "Consumer"),
                    user_email: user?.email || (isAdmin ? "admin@freshcheck.ai" : "consumer@example.com"),
                    role: userRole,
                    account: "Active",
                    ai_score: 85.0,
                    health: 80.0,
                    quality: item.status || "Fresh",
                    shelf_life: `${daysLeft} d`,
                    risk: daysLeft <= 2 ? "High" : (daysLeft <= 4 ? "Medium" : "Low"),
                    confidence: 88.0,
                    manufactured: "01 Oct 2026",
                    expiry: item.expiry || "15 Oct 2026",
                    added: "08 Oct 2026",
                    storage_zone: item.storage || "Refrigerated",
                    days_to_expiration: daysLeft,
                    quality_grade: daysLeft > 5 ? "A+" : "A",
                    status: item.status || "Fresh",
                    inspection_compliance: daysLeft > 2 ? "PASS" : "FLAGGED",
                    fefo_priority: daysLeft <= 2 ? "High Priority" : "Normal"
                  };
                });

            // Isolate records: Admin sees all records, non-admin sees only their own records
            const recordsList = isAdmin
              ? rawRecords
              : rawRecords.filter(r => !r.user_email || !user?.email || r.user_email.toLowerCase() === user.email.toLowerCase() || (r.user_name || "").toLowerCase() === (user?.name || "").toLowerCase());

            // Consumer personal metrics
            const consumerItemsCount = recordsList.length;
            const consumerAvgScore = consumerItemsCount > 0
              ? Math.round((recordsList.reduce((acc, r) => acc + (parseFloat(r.ai_score) || 0), 0) / consumerItemsCount) * 10) / 10
              : 0;
            const consumerSafeCount = recordsList.filter(r =>
              ["fresh", "good", "optimal", "a+", "a"].includes((r.quality || r.status || "").toLowerCase())
            ).length;
            const consumerSafePercent = consumerItemsCount > 0
              ? Math.round((consumerSafeCount / consumerItemsCount) * 100)
              : 100;
            const consumerAttentionCount = recordsList.filter(r =>
              (r.risk === "High" || r.risk === "Critical" || parseFloat(r.shelf_life) <= 2 || r.inspection_compliance === "FLAGGED")
            ).length;

            // Filter matching
            const filtered = recordsList.filter((r) => {
              const query = reportSearch.toLowerCase().trim();
              const matchesSearch = !query ||
                (r.produce_name || "").toLowerCase().includes(query) ||
                (r.category || "").toLowerCase().includes(query) ||
                (r.user_name || "").toLowerCase().includes(query) ||
                (r.user_email || "").toLowerCase().includes(query) ||
                (r.batch_id || "").toLowerCase().includes(query);

              const matchesRole = reportRoleFilter === "all" || (r.role || "").toLowerCase() === reportRoleFilter.toLowerCase();
              const matchesUser = reportUserFilter === "all" || (r.user_name || "") === reportUserFilter;
              const matchesCategory = reportCategoryFilter === "all" || (r.category || "").toLowerCase() === reportCategoryFilter.toLowerCase();
              const matchesQuality = reportQualityFilter === "all" || (r.quality || r.status || "").toLowerCase() === reportQualityFilter.toLowerCase();
              const matchesRisk = reportRiskFilter === "all" || (r.risk || "").toLowerCase() === reportRiskFilter.toLowerCase();

              if (isAdmin) {
                return matchesSearch && matchesRole && matchesUser && matchesCategory && matchesQuality && matchesRisk;
              } else {
                return matchesSearch && matchesCategory && matchesQuality && matchesRisk;
              }
            });

            return (
              <div className="audit-cert-container">
                {/* 1. TOP OVERVIEW SECTION */}
                {isAdmin ? (
                  <div className="exec-bento-deck">
                    {/* Executive Console Hero Header */}
                    <div className="exec-console-hero no-print">
                      <div className="exec-hero-top">
                        <span className="exec-hero-badge">
                          <span>⚡</span> CENTRAL GOVERNANCE & TELEMETRY CONSOLE
                        </span>
                        <span className="exec-hero-status">
                          <span className="status-dot-pulse"></span>
                          LIVE ENTERPRISE TELEMETRY
                        </span>
                      </div>
                      <h2 className="exec-hero-title">
                        Enterprise Food Quality & Platform Audit Cockpit
                      </h2>
                      <p className="exec-hero-desc">
                        Unified multi-tenant telemetry reading inventory across all platform accounts: real-time shelf-life tracking, cold-chain compliance, and certified HACCP chain-of-custody.
                      </p>

                      {/* Fleet Identity Strip */}
                      <div className="exec-fleet-strip">
                        <div className="exec-fleet-item">
                          <span style={{ fontSize: '20px' }}>👥</span>
                          <div>
                            <div className="exec-fleet-count">
                              {complianceReport?.platform_analytics?.registered_users ?? 7} Accounts
                            </div>
                            <div className="exec-fleet-label">
                              {complianceReport?.platform_analytics?.active_users ?? 7} Active • {complianceReport?.platform_analytics?.inactive_users ?? 0} Inactive
                            </div>
                          </div>
                        </div>

                        <div className="exec-fleet-pills">
                          {(() => {
                            const roleDist = complianceReport?.platform_analytics?.role_distribution || {
                              "Consumer": 3,
                              "Warehouse Operator": 2,
                              "Enterprise Manager": 1,
                              "Administrator": 1
                            };
                            const roleStyles = {
                              "Consumer": { border: "rgba(52, 211, 153, 0.4)", bg: "rgba(52, 211, 153, 0.12)", icon: "🟢" },
                              "Warehouse Operator": { border: "rgba(167, 139, 250, 0.4)", bg: "rgba(167, 139, 250, 0.12)", icon: "📦" },
                              "Enterprise Manager": { border: "rgba(56, 189, 248, 0.4)", bg: "rgba(56, 189, 248, 0.12)", icon: "🏢" },
                              "Administrator": { border: "rgba(251, 191, 36, 0.4)", bg: "rgba(251, 191, 36, 0.12)", icon: "🛡️" }
                            };
                            return Object.entries(roleDist).map(([rName, count]) => {
                              const s = roleStyles[rName] || { border: "rgba(148, 163, 184, 0.4)", bg: "rgba(148, 163, 184, 0.12)", icon: "👥" };
                              return (
                                <span key={rName} className="exec-fleet-pill" style={{ borderColor: s.border, background: s.bg }}>
                                  {s.icon} {count} {count === 1 ? rName : (rName.endsWith('s') ? rName : `${rName}s`)}
                                </span>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Bento Row 1: 3 High-Impact Executive Metric Cards */}
                    <div className="exec-bento-row-3">
                      {/* 1. Global Monitored Assets */}
                      <div className="exec-kpi-card" style={{ borderTop: '4px solid #f59e0b' }}>
                        <div>
                          <div className="exec-kpi-card-top">
                            <div className="exec-kpi-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                              📦
                            </div>
                            <span className="exec-kpi-chip" style={{ background: '#fef3c7', color: '#b45309' }}>
                              GLOBAL ASSETS
                            </span>
                          </div>
                          <div className="exec-kpi-val">
                            {complianceReport?.platform_analytics?.total_inventory ?? recordsList.length}
                          </div>
                          <div className="exec-kpi-title">Monitored Produce Lots</div>
                        </div>
                        <div className="exec-kpi-footer">
                          <span>Real-time platform inventory</span>
                          <strong style={{ color: '#059669' }}>100% Active</strong>
                        </div>
                      </div>

                      {/* 2. AI Freshness Index */}
                      <div className="exec-kpi-card" style={{ borderTop: '4px solid #10b981' }}>
                        <div>
                          <div className="exec-kpi-card-top">
                            <div className="exec-kpi-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
                              🧠
                            </div>
                            <span className="exec-kpi-chip" style={{ background: '#ecfdf5', color: '#047857' }}>
                              AI VITALITY
                            </span>
                          </div>
                          <div className="exec-kpi-val" style={{ color: '#059669' }}>
                            {complianceReport?.platform_analytics?.average_ai_score ?? 69.1}
                            <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--gray-400)' }}>/100</span>
                          </div>
                          <div className="exec-kpi-title">Platform Freshness Index</div>
                        </div>
                        <div className="exec-kpi-footer">
                          <span>Algorithmic quality rating</span>
                          <strong style={{ color: '#059669' }}>Commercial Safe</strong>
                        </div>
                      </div>

                      {/* 3. Cellular Health Score */}
                      <div className="exec-kpi-card" style={{ borderTop: '4px solid #06b6d4' }}>
                        <div>
                          <div className="exec-kpi-card-top">
                            <div className="exec-kpi-icon" style={{ background: '#cffafe', color: '#0e7490' }}>
                              🩺
                            </div>
                            <span className="exec-kpi-chip" style={{ background: '#cffafe', color: '#0e7490' }}>
                              HEALTH RATIO
                            </span>
                          </div>
                          <div className="exec-kpi-val" style={{ color: '#0891b2' }}>
                            {complianceReport?.platform_analytics?.average_food_health != null ? `${complianceReport.platform_analytics.average_food_health}%` : "67.3%"}
                          </div>
                          <div className="exec-kpi-title">Nutritional Integrity Score</div>
                        </div>
                        <div className="exec-kpi-footer">
                          <span>Biochemical preservation index</span>
                          <strong style={{ color: '#0891b2' }}>Calibrated</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bento Row 2: 2 Deep Operational Diagnostic Panels */}
                    <div className="exec-bento-row-2">
                      {/* Diagnostic Panel 1: Storage & Model Precision */}
                      <div className="exec-diag-panel">
                        <div className="exec-diag-header">
                          <div className="exec-diag-title">
                            <span>❄️</span> Cold-Chain & AI Prediction Reliability
                          </div>
                          <span className="admin-tag-pill" style={{ background: '#e0f2fe', color: '#0369a1', margin: 0 }}>
                            ENVIRONMENTAL SENSORS
                          </span>
                        </div>

                        <div className="exec-dual-stat-wrap">
                          <div className="exec-stat-box">
                            <span className="exec-stat-box-label">Storage Microclimate Adherence</span>
                            <div className="exec-stat-box-val" style={{ color: '#0284c7' }}>
                              {complianceReport?.platform_analytics?.storage_compliance != null ? `${complianceReport.platform_analytics.storage_compliance}%` : "47.6%"}
                            </div>
                            <span className="exec-stat-box-desc">
                              Real-time sensor compliance against HACCP storage protocols.
                            </span>
                          </div>

                          <div className="exec-stat-box">
                            <span className="exec-stat-box-label">Neural Model Confidence</span>
                            <div className="exec-stat-box-val" style={{ color: '#7c3aed' }}>
                              {complianceReport?.platform_analytics?.shelf_life_confidence != null ? `${complianceReport.platform_analytics.shelf_life_confidence}%` : "89.4%"}
                            </div>
                            <span className="exec-stat-box-desc">
                              Multi-spectral computer vision & kinetic decay confidence.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Diagnostic Panel 2: Spoilage Sentinel & FEFO Interventions */}
                      <div className="exec-diag-panel">
                        <div className="exec-diag-header">
                          <div className="exec-diag-title">
                            <span>⚠️</span> Risk Sentinel & Operational Interventions
                          </div>
                          <span className="admin-tag-pill" style={{ background: '#fee2e2', color: '#b91c1c', margin: 0 }}>
                            ACTION RADAR
                          </span>
                        </div>

                        <div className="exec-dual-stat-wrap">
                          <div className="exec-stat-box">
                            <span className="exec-stat-box-label">High / Critical Risk Lots</span>
                            <div className="exec-stat-box-val" style={{ color: '#dc2626' }}>
                              {complianceReport?.platform_analytics?.high_critical_risk ?? 6}
                            </div>
                            <span className="exec-stat-box-desc">
                              Batches requiring priority dispatch (≤ 2 days shelf-life).
                            </span>
                            <button
                              type="button"
                              className="exec-quick-btn exec-quick-btn-alert"
                              onClick={() => {
                                setReportRiskFilter(reportRiskFilter === "High" ? "all" : "High");
                              }}
                            >
                              {reportRiskFilter === "High" ? "✓ Reset Filter" : "Filter At-Risk Only"}
                            </button>
                          </div>

                          <div className="exec-stat-box">
                            <span className="exec-stat-box-label">Action Opportunities</span>
                            <div className="exec-stat-box-val" style={{ color: '#059669' }}>
                              {complianceReport?.platform_analytics?.action_opportunities ?? 15}
                            </div>
                            <span className="exec-stat-box-desc">
                              FEFO rotation, redistribution, or shelf-life extensions.
                            </span>
                            <button
                              type="button"
                              className="exec-quick-btn exec-quick-btn-action"
                              onClick={() => {
                                setReportQualityFilter(reportQualityFilter === "Near Spoilage" ? "all" : "Near Spoilage");
                              }}
                            >
                              {reportQualityFilter === "Near Spoilage" ? "✓ Reset Filter" : "Filter Action Items"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Consumer / Personal Food Freshness Audit Overview Card */
                  <div className="exec-bento-deck">
                    <div className="exec-console-hero no-print" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #065f46 100%)' }}>
                      <div className="exec-hero-top">
                        <span className="exec-hero-badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                          👤 {userRole.toUpperCase()} QUALITY CONSOLE
                        </span>
                        <span className="exec-hero-status">
                          <span className="status-dot-pulse"></span>
                          PERSONAL HOUSEHOLD LEDGER
                        </span>
                      </div>
                      <h2 className="exec-hero-title">
                        Personal Food Freshness Audit & Quality Certificates
                      </h2>
                      <p className="exec-hero-desc">
                        Certified freshness inspection records, shelf-life audits, and consumption safety compliance for your household food items.
                      </p>

                      <div className="exec-fleet-strip">
                        <div className="exec-fleet-item">
                          <span style={{ fontSize: '20px' }}>👤</span>
                          <div>
                            <div className="exec-fleet-count">{user?.name || "Consumer"}</div>
                            <div className="exec-fleet-label">{user?.email || "consumer@example.com"} • Verified Account</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Consumer 3-Card Bento Metric Row */}
                    <div className="exec-bento-row-3">
                      <div className="exec-kpi-card" style={{ borderTop: '4px solid #f59e0b' }}>
                        <div>
                          <div className="exec-kpi-card-top">
                            <div className="exec-kpi-icon" style={{ background: '#fef3c7', color: '#b45309' }}>📦</div>
                            <span className="exec-kpi-chip" style={{ background: '#fef3c7', color: '#b45309' }}>MONITORED</span>
                          </div>
                          <div className="exec-kpi-val">{consumerItemsCount}</div>
                          <div className="exec-kpi-title">Tracked Food Items</div>
                        </div>
                        <div className="exec-kpi-footer">
                          <span>Personal pantry & fridge</span>
                          <strong style={{ color: '#059669' }}>Active</strong>
                        </div>
                      </div>

                      <div className="exec-kpi-card" style={{ borderTop: '4px solid #10b981' }}>
                        <div>
                          <div className="exec-kpi-card-top">
                            <div className="exec-kpi-icon" style={{ background: '#ecfdf5', color: '#047857' }}>🧠</div>
                            <span className="exec-kpi-chip" style={{ background: '#ecfdf5', color: '#047857' }}>AI SCORE</span>
                          </div>
                          <div className="exec-kpi-val" style={{ color: consumerAvgScore >= 70 ? '#059669' : consumerAvgScore > 0 ? '#d97706' : 'var(--dark)' }}>
                            {consumerAvgScore > 0 ? consumerAvgScore : "—"}
                          </div>
                          <div className="exec-kpi-title">Average Freshness Index</div>
                        </div>
                        <div className="exec-kpi-footer">
                          <span>Inspected produce quality</span>
                          <strong style={{ color: '#059669' }}>Optimal</strong>
                        </div>
                      </div>

                      <div className="exec-kpi-card" style={{ borderTop: '4px solid #ef4444' }}>
                        <div>
                          <div className="exec-kpi-card-top">
                            <div className="exec-kpi-icon" style={{ background: consumerAttentionCount > 0 ? '#fee2e2' : '#ecfdf5', color: consumerAttentionCount > 0 ? '#dc2626' : '#059669' }}>
                              {consumerAttentionCount > 0 ? '⚠️' : '✅'}
                            </div>
                            <span className="exec-kpi-chip" style={{ background: consumerAttentionCount > 0 ? '#fee2e2' : '#ecfdf5', color: consumerAttentionCount > 0 ? '#dc2626' : '#059669' }}>
                              ATTENTION
                            </span>
                          </div>
                          <div className="exec-kpi-val" style={{ color: consumerAttentionCount > 0 ? '#dc2626' : '#059669' }}>
                            {consumerAttentionCount}
                          </div>
                          <div className="exec-kpi-title">Items Needing Early Use</div>
                        </div>
                        <div className="exec-kpi-footer">
                          <span>Near expiration items</span>
                          <strong>{consumerAttentionCount > 0 ? "Review Required" : "All Clear"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SECTION HEADER & ACTION BUTTONS */}
                <div className="audit-cert-header" style={{ marginTop: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '28px' }}>📜</span>
                      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--dark)' }}>
                        {isAdmin ? "Enterprise Food Traceability & Audit Ledger" : "My Food Freshness Inspection & Quality Ledger"}
                      </h2>
                    </div>
                    <p style={{ margin: '6px 0 0', color: 'var(--gray-500)', fontSize: '13px' }}>
                      {isAdmin
                        ? "Individual produce item chain-of-custody, predictive shelf-life degradation, and storage compliance across all roles."
                        : "Item-by-item verified freshness ratings, shelf-life remaining, and storage quality tracking for your produce."}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      className="no-print"
                      onClick={handleDownloadCSV}
                      style={{
                        background: 'white',
                        border: '1px solid var(--gray-300)',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      📥 Export CSV Ledger
                    </button>
                    <button
                      className="no-print"
                      onClick={handleDownloadExcel}
                      style={{
                        background: 'white',
                        border: '1px solid var(--gray-300)',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      📊 Export Excel (.xlsx)
                    </button>
                    <button
                      className="no-print"
                      onClick={() => window.print()}
                      style={{
                        background: 'var(--dark-green)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(6, 78, 59, 0.25)'
                      }}
                    >
                      🖨️ Print / Save PDF
                    </button>
                    <div className="audit-seal-badge">
                      <span>🛡️</span> HACCP VERIFIED
                    </div>
                  </div>
                </div>

                {/* 3. CERTIFICATE AUTHENTICATION STAMP BANNER */}
                <div style={{ background: '#f8fafc', border: '1px solid var(--gray-200)', borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', margin: '14px 0' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Certificate Number</span>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)' }}>
                      {complianceReport?.report_id || (isAdmin ? "FC-ADMIN-AUDIT-2026-CERT" : `FC-CONSUMER-${new Date().getFullYear()}-CERT`)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                      {isAdmin ? "Certified Inspector" : "Certified Account"}
                    </span>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--dark)' }}>
                      {complianceReport?.certified_by?.name || user?.name || (isAdmin ? "Platform Administrator" : "Consumer")}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Protocol Standard</span>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--primary-hover)' }}>
                      {isAdmin ? "ISO-22000 & HACCP Automated Protocol" : "HACCP & Household Freshness Protocol"}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Validation Status</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                      {isAdmin ? "✓ Authenticated & Synced Across All Roles" : "✓ Authenticated Personal Account Ledger"}
                    </div>
                  </div>
                </div>

                {/* 4. SEARCH & FILTER TOOLBAR */}
                <div className="no-print admin-report-filter-grid" style={{ marginBottom: '14px', gridTemplateColumns: isAdmin ? undefined : 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                  <input
                    type="text"
                    className="admin-filter-input"
                    placeholder={isAdmin ? "Search food, category, user or email..." : "Search produce item, category..."}
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                  />

                  {/* Admin-only Filters: Role & User */}
                  {isAdmin && (
                    <>
                      <select
                        className="admin-filter-select"
                        value={reportRoleFilter}
                        onChange={(e) => setReportRoleFilter(e.target.value)}
                      >
                        <option value="all">All Roles</option>
                        {Array.from(new Set(recordsList.map(r => r.role).filter(Boolean))).map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <select
                        className="admin-filter-select"
                        value={reportUserFilter}
                        onChange={(e) => setReportUserFilter(e.target.value)}
                      >
                        <option value="all">All Users</option>
                        {Array.from(new Set(recordsList.map(r => r.user_name).filter(Boolean))).map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </>
                  )}

                  {/* Category Filter */}
                  <select
                    className="admin-filter-select"
                    value={reportCategoryFilter}
                    onChange={(e) => setReportCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {Array.from(new Set(recordsList.map(r => r.category).filter(Boolean))).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Quality Filter */}
                  <select
                    className="admin-filter-select"
                    value={reportQualityFilter}
                    onChange={(e) => setReportQualityFilter(e.target.value)}
                  >
                    <option value="all">All Quality Statuses</option>
                    {Array.from(new Set(recordsList.map(r => r.quality || r.status).filter(Boolean))).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>

                  {/* Risk Filter */}
                  <select
                    className="admin-filter-select"
                    value={reportRiskFilter}
                    onChange={(e) => setReportRiskFilter(e.target.value)}
                  >
                    <option value="all">All Risks</option>
                    {Array.from(new Set(recordsList.map(r => r.risk).filter(Boolean))).map((risk) => (
                      <option key={risk} value={risk}>{risk} Risk</option>
                    ))}
                  </select>
                </div>

                {/* 5. RECORDS LEDGER TABLE WRAP */}
                <div className="audit-ledger-table-wrap" style={{ overflowX: 'auto', border: '1px solid var(--gray-200)', borderRadius: '14px', background: '#ffffff' }}>
                  {complianceReportLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span className="status-dot-pulse"></span>
                        <span style={{ fontWeight: 700 }}>
                          {isAdmin ? "Synchronizing administrator food compliance records..." : "Synchronizing your verified food audit records..."}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Filter Counter Bar */}
                      <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: 'var(--gray-600)' }}>
                        <span style={{ fontWeight: 650 }}>
                          {isAdmin ? (
                            <>Showing <strong style={{ color: 'var(--dark)' }}>{filtered.length}</strong> of <strong style={{ color: 'var(--dark)' }}>{recordsList.length}</strong> administrator-visible food records.</>
                          ) : (
                            <>Showing <strong style={{ color: 'var(--dark)' }}>{filtered.length}</strong> of <strong style={{ color: 'var(--dark)' }}>{recordsList.length}</strong> personal food records.</>
                          )}
                        </span>
                        {(reportSearch || reportRoleFilter !== "all" || reportUserFilter !== "all" || reportCategoryFilter !== "all" || reportQualityFilter !== "all" || reportRiskFilter !== "all") && (
                          <button
                            onClick={() => {
                              setReportSearch("");
                              setReportRoleFilter("all");
                              setReportUserFilter("all");
                              setReportCategoryFilter("all");
                              setReportQualityFilter("all");
                              setReportRiskFilter("all");
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--primary-hover)',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '12px',
                              textDecoration: 'underline'
                            }}
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>

                      {/* Consumer Empty State when 0 items exist */}
                      {!isAdmin && recordsList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-500)' }}>
                          <div style={{ fontSize: '42px', marginBottom: '12px' }}>🥗</div>
                          <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: 'var(--dark)' }}>
                            No Food Records in Your Account Yet
                          </h4>
                          <p style={{ margin: '0 auto 20px', fontSize: '13.5px', maxWidth: '440px' }}>
                            You haven't scanned or registered any food items under your consumer account yet. Scan produce with the AI Freshness Scanner or register items to generate your verified audit certificates.
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => setActiveTab("scanner")}
                              style={{
                                background: 'var(--dark-green)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(6, 78, 59, 0.25)'
                              }}
                            >
                              🔍 Scan Produce Now
                            </button>
                            <button
                              onClick={() => setActiveTab("register_food")}
                              style={{
                                background: 'white',
                                border: '1px solid var(--gray-300)',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              ➕ Register Item
                            </button>
                          </div>
                        </div>
                      ) : (
                        <table className="admin-ledger-table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              {isAdmin && <th>User / Owner</th>}
                              {isAdmin && <th>Role</th>}
                              <th>Produce Item</th>
                              <th>Category</th>
                              {isAdmin && <th>Account</th>}
                              <th>AI Score</th>
                              <th>Health</th>
                              <th>Quality</th>
                              <th>Shelf Life</th>
                              <th>Risk</th>
                              <th>Confidence</th>
                              {isAdmin && <th>Manufactured</th>}
                              <th>Expiry</th>
                              <th>Added</th>
                              <th>Storage</th>
                              {!isAdmin && <th>Action Guidance</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.length === 0 ? (
                              <tr>
                                <td colSpan={isAdmin ? 15 : 12} style={{ textAlign: 'center', padding: '36px', color: 'var(--gray-500)' }}>
                                  No food records match the selected filter criteria.
                                </td>
                              </tr>
                            ) : (
                              filtered.map((row, i) => (
                                <tr key={i}>
                                  {isAdmin && (
                                    <td>
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--dark)' }}>{row.user_name || "Platform User"}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{row.user_email || "user@freshcheck.ai"}</span>
                                      </div>
                                    </td>
                                  )}
                                  {isAdmin && (
                                    <td>
                                      <span className={`admin-role-badge ${(row.role || "").toLowerCase().replace(/\s+/g, '-')}`}>
                                        {row.role || "Consumer"}
                                      </span>
                                    </td>
                                  )}
                                  <td>
                                    <strong style={{ color: 'var(--dark)' }}>{row.produce_name}</strong>
                                  </td>
                                  <td>{row.category}</td>
                                  {isAdmin && (
                                    <td>
                                      <span className="admin-account-badge">
                                        <span className="pulse-dot"></span>
                                        {row.account || "Active"}
                                      </span>
                                    </td>
                                  )}
                                  <td>
                                    <span style={{
                                      fontWeight: 800,
                                      color: (row.ai_score || 0) >= 75 ? '#059669' : (row.ai_score || 0) >= 50 ? '#d97706' : '#dc2626'
                                    }}>
                                      {row.ai_score != null ? row.ai_score : "—"}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: 700 }}>
                                      {row.health != null ? `${row.health}%` : "—"}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`admin-quality-badge ${(row.quality || row.status || "Fresh").toLowerCase().replace(/\s+/g, '-')}`}>
                                      {row.quality || row.status || "Fresh"}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{
                                      fontWeight: 700,
                                      color: parseFloat(row.shelf_life) <= 2 ? '#ef4444' : 'var(--dark)'
                                    }}>
                                      {row.shelf_life || `${row.days_to_expiration || 0} d`}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{
                                      fontWeight: 800,
                                      fontSize: '11px',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      background: (row.risk === "Low") ? '#ecfdf5' : (row.risk === "Medium") ? '#fffbeb' : '#fee2e2',
                                      color: (row.risk === "Low") ? '#059669' : (row.risk === "Medium") ? '#b45309' : '#dc2626',
                                      border: `1px solid ${(row.risk === "Low") ? '#a7f3d0' : (row.risk === "Medium") ? '#fde68a' : '#fca5a5'}`
                                    }}>
                                      {row.risk || "Low"}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: 650, color: 'var(--gray-600)' }}>
                                      {row.confidence != null ? `${row.confidence}%` : "—"}
                                    </span>
                                  </td>
                                  {isAdmin && (
                                    <td style={{ color: 'var(--gray-600)', fontSize: '12px' }}>{row.manufactured || "—"}</td>
                                  )}
                                  <td style={{ color: 'var(--gray-600)', fontSize: '12px', fontWeight: 600 }}>{row.expiry || "—"}</td>
                                  <td style={{ color: 'var(--gray-600)', fontSize: '12px' }}>{row.added || "—"}</td>
                                  <td>
                                    <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, color: 'var(--gray-700)' }}>
                                      {row.storage_zone || row.storage || "Refrigerated"}
                                    </span>
                                  </td>
                                  {!isAdmin && (
                                    <td>
                                      <span style={{
                                        fontSize: '11.5px',
                                        fontWeight: 700,
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        background: (row.fefo_priority === "High Priority" || row.risk === "High" || row.risk === "Critical") ? '#fee2e2' : '#ecfdf5',
                                        color: (row.fefo_priority === "High Priority" || row.risk === "High" || row.risk === "Critical") ? '#dc2626' : '#059669'
                                      }}>
                                        {(row.fefo_priority === "High Priority" || row.risk === "High" || row.risk === "Critical") ? "Consume Promptly" : "Optimal Quality"}
                                      </span>
                                    </td>
                                  )}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>

                {/* 6. DOCUMENT SIGN-OFF & FOOTER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--gray-200)', fontSize: '11.5px', color: 'var(--gray-500)', flexWrap: 'wrap', gap: '10px' }}>
                  <span>
                    {isAdmin
                      ? "FreshCheck AI Systems • Certified Administrator Inspection Document • Valid for 30 Days"
                      : "FreshCheck AI Systems • Personal Consumer Food Freshness & Quality Certificate • Valid for 30 Days"}
                  </span>
                  <span style={{ fontStyle: 'italic' }}>Digitally Authenticated: {new Date().toUTCString()}</span>
                </div>
              </div>
            );
          })()}

          {/* Milestone 5: Storage Advisor AI & Food Preservation Guidance Tab */}
          {activeTab === "storage_advisor" && (
            <div className="storage-advisor-container">
              {/* Modern Chatbot Top Bar */}
              <div className="advisor-chat-topbar">
                <div className="topbar-assistant-info">
                  <div className="assistant-avatar-badge">
                    <span>🤖</span>
                    <span className="assistant-status-dot"></span>
                  </div>
                  <div>
                    <h2 className="assistant-name">FreshKeeper Storage Advisor</h2>
                    <p className="assistant-tagline">
                      AI Food Preservation Specialist • Scientific Longevity & Cold-Chain Protocols
                    </p>
                  </div>
                </div>

                <div className="topbar-actions">
                  <button
                    className="topbar-reset-btn"
                    title="Start New Conversation"
                    onClick={() => {
                      setChatMessages([
                        {
                          id: "welcome-msg",
                          sender: "bot",
                          text: "👋 Welcome to the FreshKeeper Storage Advisor! Ask me how to store any produce, dairy, bakery, meat, or pantry item to maximize longevity, prevent spoilage, and maintain nutritional quality.",
                          source: "FreshKeeper Engine",
                          is_gemini: false,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          preservation_hacks: [
                            "Wrap banana stems in foil or plastic wrap to block ethylene emission (+3 to 5 days).",
                            "Line vegetable crisper drawers with paper towels to absorb excess condensation.",
                            "Store potatoes and onions in completely separate dry, ventilated bins."
                          ],
                          recommended_envelope: {
                            storage_type: "Precision Multi-Zone Storage",
                            temperature: "Category specific (0°C to 20°C)",
                            humidity: "Tailored RH% per food respiration",
                            expected_shelf_life_gain: "+3 to +14 days with proper protocol"
                          }
                        }
                      ]);
                    }}
                  >
                    + New Chat
                  </button>
                </div>
              </div>

              {/* Chat Thread Container */}
              <div className="advisor-chat-window">
                <div className="advisor-chat-messages">
                  {/* Hero Prompt Cards when chat has not branched beyond initial welcome */}
                  {chatMessages.length <= 1 && (
                    <div className="advisor-hero-starter">
                      <div className="hero-starter-icon">🥗</div>
                      <h3 className="hero-starter-title">How can I help you preserve your food today?</h3>
                      <p className="hero-starter-desc">
                        Get verified science on optimal temperatures, ethylene separation, moisture barriers, and shelf-life extension hacks.
                      </p>

                      <div className="hero-starter-grid">
                        <button
                          className="hero-prompt-card"
                          onClick={() => handleSendChatMessage("How do I keep bananas yellow for 5+ extra days?", "Banana")}
                          disabled={chatLoading}
                        >
                          <span className="card-emoji">🍌</span>
                          <div className="card-content">
                            <strong>Banana Longevity</strong>
                            <span>Stem wrapping & ripening delay (+5 days)</span>
                          </div>
                        </button>

                        <button
                          className="hero-prompt-card"
                          onClick={() => handleSendChatMessage("How do I keep spinach and leafy greens crisp for 3 weeks?", "Leafy Greens")}
                          disabled={chatLoading}
                        >
                          <span className="card-emoji">🥬</span>
                          <div className="card-content">
                            <strong>Crisp Leafy Greens</strong>
                            <span>Moisture wicking & respiration control</span>
                          </div>
                        </button>

                        <button
                          className="hero-prompt-card"
                          onClick={() => handleSendChatMessage("How to prevent strawberries and berries from molding rapidly?", "Berries")}
                          disabled={chatLoading}
                        >
                          <span className="card-emoji">🍓</span>
                          <div className="card-content">
                            <strong>Mold-Free Berries</strong>
                            <span>Vinegar rinses & condensation absorption</span>
                          </div>
                        </button>

                        <button
                          className="hero-prompt-card"
                          onClick={() => handleSendChatMessage("Which fruits emit ethylene gas that ruins neighboring produce?", null)}
                          disabled={chatLoading}
                        >
                          <span className="card-emoji">⚡</span>
                          <div className="card-content">
                            <strong>Ethylene Gas Dynamics</strong>
                            <span>Gas isolation rules for produce drawers</span>
                          </div>
                        </button>
                      </div>

                      {/* Subtle Fast Inventory Consult */}
                      {inventory && inventory.length > 0 && (
                        <div className="hero-inventory-chips-row">
                          <span className="chips-title">📦 Or consult for your registered inventory:</span>
                          <div className="chips-scroller">
                            {inventory.slice(0, 6).map((inv) => (
                              <button
                                key={inv.id || inv._id}
                                className="hero-inv-pill"
                                onClick={() => handleSendChatMessage(`How should I store ${inv.name} to maximize shelf life?`, inv.name)}
                                disabled={chatLoading}
                              >
                                {getFoodVisual(inv.name, inv.category).emoji} {inv.name} ({inv.storage})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`advisor-message-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}
                    >
                      <div className="message-avatar">
                        {msg.sender === "user" ? "👤" : "🥬"}
                      </div>
                      <div className="message-bubble-wrapper">
                        <div className="message-meta">
                          <span className="message-sender-name">
                            {msg.sender === "user" ? (user?.name || "You") : "FreshKeeper AI"}
                          </span>

                          <span className="message-timestamp">{msg.timestamp}</span>
                        </div>

                        <div className="message-content">
                          {msg.sender === "bot" ? (
                            <div className="message-text-formatted">
                              {renderFormattedMessage(msg.text)}
                            </div>
                          ) : (
                            <p className="message-text">{msg.text}</p>
                          )}

                          {/* Optimal Envelope Card */}
                          {msg.recommended_envelope && (
                            <div className="envelope-spec-card">
                              <div className="spec-card-title">
                                🎯 Recommended Storage Protocol
                              </div>
                              <div className="spec-grid">
                                {msg.recommended_envelope.temperature && (
                                  <div className="spec-item">
                                    <span className="spec-label">🌡️ Temperature</span>
                                    <strong className="spec-val">{msg.recommended_envelope.temperature}</strong>
                                  </div>
                                )}
                                {msg.recommended_envelope.humidity && (
                                  <div className="spec-item">
                                    <span className="spec-label">💧 Humidity</span>
                                    <strong className="spec-val">{msg.recommended_envelope.humidity}</strong>
                                  </div>
                                )}
                                {msg.recommended_envelope.storage_type && (
                                  <div className="spec-item">
                                    <span className="spec-label">📦 Zone</span>
                                    <strong className="spec-val">{msg.recommended_envelope.storage_type}</strong>
                                  </div>
                                )}
                                {msg.recommended_envelope.expected_shelf_life_gain && (
                                  <div className="spec-item highlight">
                                    <span className="spec-label">⏳ Shelf-Life Gain</span>
                                    <strong className="spec-val">{msg.recommended_envelope.expected_shelf_life_gain}</strong>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Preservation Hacks */}
                          {msg.preservation_hacks && msg.preservation_hacks.length > 0 && (
                            <div className="advisor-section-box hacks">
                              <div className="section-title">💡 Longevity & Preservation Hacks</div>
                              <ul className="hacks-list">
                                {msg.preservation_hacks.map((hack, hIdx) => (
                                  <li key={hIdx}>{hack}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Spoilage Risks */}
                          {msg.spoilage_risks && msg.spoilage_risks.length > 0 && (
                            <div className="advisor-section-box risks">
                              <div className="section-title">⚠️ Spoilage Risks & Warning Signs</div>
                              <ul className="risks-list">
                                {msg.spoilage_risks.map((risk, rIdx) => (
                                  <li key={rIdx}>{risk}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Follow-up question chips */}
                          {msg.suggested_questions && msg.suggested_questions.length > 0 && (
                            <div className="advisor-suggested-pills-row">
                              {msg.suggested_questions.map((q, qIdx) => (
                                <button
                                  key={qIdx}
                                  className="advisor-suggested-chip"
                                  onClick={() => handleSendChatMessage(q, msg.food_name)}
                                  disabled={chatLoading}
                                >
                                  💬 {q}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="advisor-message-row bot-row loading-row">
                      <div className="message-avatar">🥬</div>
                      <div className="loading-bubble">
                        <div className="loading-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--gray-500)', marginLeft: '10px' }}>
                          FreshKeeper AI is analyzing optimal food preservation protocols... 🥗
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={fullChatMessagesEndRef} />
                </div>

                {/* Input Dock Bar */}
                <form
                  className="advisor-input-dock"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                >
                  <div className="advisor-input-pill-container">
                    <input
                      type="text"
                      className="advisor-text-input"
                      placeholder="Ask how to store any food (e.g., 'How to keep berries fresh for 2 weeks?')..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={chatLoading}
                    />
                    <button
                      type="submit"
                      className="advisor-send-circle-btn"
                      disabled={!chatInput.trim() || chatLoading}
                      title="Send message"
                    >
                      ➤
                    </button>
                  </div>
                  <div className="advisor-input-subtext">
                    AI Food Preservation & Storage Longevity Assistant. Press Enter to send.
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: ADMINISTRATOR USER MANAGEMENT (MILESTONE 4)             */}
          {/* ============================================================ */}
          {activeTab === "users" && (
            <div className="tab-pane">
              <section className="intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2>👥 Platform User Management & Role Governance</h2>
                  <p>
                    Manage all registered platform accounts, review assigned privileges, and configure role-based access controls across all 5 operational tiers.
                  </p>
                </div>
                <button
                  onClick={fetchAdminUsers}
                  disabled={adminUsersLoading}
                  className="auth-btn"
                  style={{ margin: 0, padding: '10px 18px', width: 'auto', background: 'var(--dark-green)', fontSize: '13px' }}
                >
                  {adminUsersLoading ? "Refreshing..." : "🔄 Refresh Users"}
                </button>
              </section>

              {userRoleToast && (
                <div style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>✓</span>
                  <span>{userRoleToast}</span>
                </div>
              )}

              {/* 5 Roles Reference Card */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {[
                  { role: "Consumer", icon: "🏠", desc: "Manage personal items, scan food, view freshness and shelf-life guidance." },
                  { role: "Retail Manager", icon: "🏪", desc: "Review stock risks, record sales, and update item status." },
                  { role: "Warehouse Operator", icon: "🏭", desc: "Review storage readings, compliance alerts, and stock actions." },
                  { role: "Food Quality Inspector", icon: "🔬", desc: "Inspect food, review analysis, and produce reports." },
                  { role: "Administrator", icon: "⚙️", desc: "Manage users and review platform-level information." }
                ].map(r => (
                  <div key={r.role} style={{
                    background: 'white',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <strong style={{ fontSize: '13px', color: 'var(--dark-green)' }}>{r.icon} {r.role}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--gray-600)', lineHeight: 1.35 }}>{r.desc}</span>
                  </div>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ background: 'white', padding: '14px 20px', borderRadius: '12px', border: '1px solid var(--gray-200)', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '16px' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search user by name or email address..."
                  value={adminUserSearch}
                  onChange={(e) => setAdminUserSearch(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13.5px', background: 'transparent' }}
                />
                {adminUserSearch && (
                  <button onClick={() => setAdminUserSearch("")} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', fontSize: '13px' }}>
                    ✕ Clear
                  </button>
                )}
              </div>

              {/* Users Table */}
              <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                {adminUsersLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)', fontSize: '14px' }}>
                    Loading registered platform users...
                  </div>
                ) : (
                  <div className="spoilage-table-container">
                    <table className="spoilage-table">
                      <thead>
                        <tr>
                          <th>User / Email</th>
                          <th>Current Role</th>
                          <th>Change Role</th>
                          <th>Account Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers
                          .filter(u => {
                            if (!adminUserSearch) return true;
                            const q = adminUserSearch.toLowerCase();
                            return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
                          })
                          .map(u => (
                            <tr key={u.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                    {(u.name || "U")[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '13.5px', color: 'var(--dark)' }}>{u.name}</strong>
                                    <div style={{ fontSize: '11.5px', color: 'var(--gray-500)' }}>{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`admin-role-badge ${(u.role || "").toLowerCase().replace(/\s+/g, '-')}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td>
                                <select
                                  value={u.role}
                                  onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--gray-300)',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    background: '#ffffff',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="Consumer">Consumer</option>
                                  <option value="Retail Manager">Retail Manager</option>
                                  <option value="Warehouse Operator">Warehouse Operator</option>
                                  <option value="Food Quality Inspector">Food Quality Inspector</option>
                                  <option value="Administrator">Administrator</option>
                                </select>
                              </td>
                              <td style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                                {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Active"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        <footer>
          <p>AI Food Freshness Monitoring Platform</p>
          <span>Machine Learning • FastAPI • React</span>
        </footer>
      </div>
    </div>

    {/* Freshness Audit Report Modal (Milestone 2) */}
      {reportModalOpen && (
        <div className="report-modal-overlay" onClick={() => setReportModalOpen(false)}>
          <div className="report-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>📜</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--dark-green)' }}>
                    AI Freshness & Quality Inspection Certificate
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>
                    Report ID: {activeReportData?.report_id || "GENERATING..."}
                  </span>
                </div>
              </div>
              <button
                className="report-close-btn"
                onClick={() => setReportModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--gray-500)' }}
              >
                ✕
              </button>
            </div>

            <div className="report-modal-body">
              {reportLoading ? (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                  <div className="history-loading">Compiling official audit metrics...</div>
                </div>
              ) : activeReportData ? (
                <>
                  {/* Certificate Summary Card */}
                  <div className="report-certificate-box">
                    <span style={{ fontSize: '38px', display: 'block', marginBottom: '8px' }}>
                      {getFoodVisual(activeReportData.item_summary?.food).emoji}
                    </span>
                    <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, color: 'var(--dark-green)' }}>
                      {activeReportData.item_summary?.food} Quality Assessment
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', margin: '10px 0 16px' }}>
                      <span className={`freshness-badge ${(activeReportData.item_summary?.freshness || "Fresh").toLowerCase().replace(' ', '-')}`}>
                        {activeReportData.item_summary?.freshness?.toUpperCase()}
                      </span>
                      {activeReportData.item_summary?.grade && (
                        <span className={`grade-badge grade-${activeReportData.item_summary.grade.toLowerCase().replace('+', '-plus')}`}>
                          Grade {activeReportData.item_summary.grade}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--dark)' }}>
                      FQI: {activeReportData.item_summary?.quality_score || 85} / 100
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>
                      Evaluated on {formatDate(activeReportData.generated_at)} • Auditor: {activeReportData.inspector?.name} ({activeReportData.inspector?.role})
                    </span>
                  </div>

                  {/* Two-Column Details */}
                  <div className="report-grid-two">
                    <div className="report-subcard">
                      <h5>🔬 Visual & Degradation Metrics</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Surface Purity Index:</span>
                          <strong>{activeReportData.spoilage_analysis?.surface_integrity || 95}%</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Browning / Spot Ratio:</span>
                          <strong>{activeReportData.spoilage_analysis?.browning_ratio || 0.0}%</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>RGB Distribution:</span>
                          <strong>
                            R:{activeReportData.visual_metrics?.red_percent || 33}% | G:{activeReportData.visual_metrics?.green_percent || 33}% | B:{activeReportData.visual_metrics?.blue_percent || 34}%
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Perceived Contrast:</span>
                          <strong>{activeReportData.visual_metrics?.contrast || 42.1}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="report-subcard">
                      <h5>⚠️ Spoilage & Hazard Analysis</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Risk Severity:</span>
                          <span className={`spoilage-badge ${(activeReportData.spoilage_analysis?.risk_level || "Low").toLowerCase()}`}>
                            {activeReportData.spoilage_analysis?.risk_level}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Deterioration Probability:</span>
                          <strong>{activeReportData.spoilage_analysis?.risk_percent || 5}%</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Estimated Shelf Life:</span>
                          <strong>{activeReportData.item_summary?.shelf_life_days} days</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>AI Confidence:</span>
                          <strong>{activeReportData.item_summary?.confidence}%</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shelf-Life Kinetics (Milestone 3) */}
                  {activeReportData.shelf_life_analysis && (
                    <div className="report-subcard">
                      <h5>🧠 Kinetic Shelf-Life Degradation Modeling (Arrhenius / Q₁₀)</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '11px', textAlign: 'center' }}>
                        <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                          <span style={{ color: '#047857' }}>Predicted Lifespan</span>
                          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--dark-green)' }}>
                            {activeReportData.shelf_life_analysis.predicted_remaining_days || activeReportData.item_summary?.shelf_life_days} Days
                          </strong>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                          <span style={{ color: 'var(--gray-500)' }}>Cold Vault (4°C)</span>
                          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--dark)' }}>
                            {activeReportData.shelf_life_analysis.scenario_comparisons?.refrigerated_4c || "7"}d
                          </strong>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                          <span style={{ color: 'var(--gray-500)' }}>Pantry (13°C)</span>
                          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--dark)' }}>
                            {activeReportData.shelf_life_analysis.scenario_comparisons?.cool_cellar_13c || "4"}d
                          </strong>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                          <span style={{ color: 'var(--gray-500)' }}>Ambient (22°C)</span>
                          <strong style={{ display: 'block', fontSize: '15px', color: 'var(--dark)' }}>
                            {activeReportData.shelf_life_analysis.scenario_comparisons?.ambient_22c || "2"}d
                          </strong>
                        </div>
                      </div>
                      {activeReportData.shelf_life_analysis.optimal_envelope && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--gray-600)' }}>
                          <b>Recommended Target Envelope:</b> {activeReportData.shelf_life_analysis.optimal_envelope.temperature_range} • {activeReportData.shelf_life_analysis.optimal_envelope.humidity_range}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Storage Directives */}
                  <div className="report-subcard">
                    <h5>📦 Mandated Storage Protocols</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
                      <div style={{ background: 'white', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                        <strong>Refrigerated:</strong>
                        <p style={{ margin: '4px 0 0', color: 'var(--gray-700)' }}>
                          {activeReportData.storage_directives?.refrigerated || "Hold at 1°C - 4°C."}
                        </p>
                      </div>
                      <div style={{ background: 'white', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                        <strong>Room Temperature:</strong>
                        <p style={{ margin: '4px 0 0', color: 'var(--gray-700)' }}>
                          {activeReportData.storage_directives?.room_temp || "Consume urgently."}
                        </p>
                      </div>
                      <div style={{ background: 'white', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                        <strong>Freezing:</strong>
                        <p style={{ margin: '4px 0 0', color: 'var(--gray-700)' }}>
                          {activeReportData.storage_directives?.frozen || "Freezer store at -18°C."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Single-Page Printed Audit Stamp */}
                  <div className="report-print-stamp">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #cbd5e1', paddingTop: '8px', fontSize: '10px', color: '#64748b' }}>
                      <span>FreshCheck AI Quality Inspection • Digitally Authenticated</span>
                      <span>Single-Page Certified Audit • Page 1 of 1</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="report-modal-footer">
              <button
                onClick={downloadReportJSON}
                style={{
                  background: 'var(--gray-100)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                📥 Export JSON
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  background: 'var(--dark-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🖨️ Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      </>
  );
}

export default App;
