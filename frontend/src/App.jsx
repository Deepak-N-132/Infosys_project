import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

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

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState("scanner");

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
  const [invQty, setInvQty] = useState("1 unit");
  const [invStatus, setInvStatus] = useState("Fresh");
  const [invStorage, setInvStorage] = useState("Refrigerated");
  const [invExpiry, setInvExpiry] = useState("");
  const [invFilter, setInvFilter] = useState("All");
  const [invImage, setInvImage] = useState(null);
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

  // Fetch Inventory Insights
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
      const response = await fetch(`${API_URL}/inventory/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(prev => prev.map(item => item.id === itemId ? data.item : item));
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

  // Verify token and fetch user on load
  useEffect(() => {
    fetchDbStatus();
    if (token) {
      verifyToken();
    }
  }, [token]);

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
      } else {
        // Token invalid, log out
        handleLogout();
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      handleLogout();
    }
  };

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

  const fetchSpoilageAlerts = async () => {
    setSpoilageLoading(true);
    try {
      const response = await fetch(`${API_URL}/spoilage-alerts`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        setView("app");
        setAuthEmail("");
        setAuthPassword("");
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

      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      setView("app");
      setLoginStep("credentials");
      setAuthEmail("");
      setAuthPassword("");
      setOtpCode("");
      setOtpDemoCode("");
      setOtpMessage("");
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
    if (!invName || !invQty) return;
    const expiryDate = invExpiry || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const response = await fetch(`${API_URL}/inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: invName,
          category: invCategory,
          qty: invQty,
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
        setInvQty("1 unit");
        setInvStatus("Fresh");
        setInvStorage("Refrigerated");
        setInvExpiry("");
        setInvImage(null);
        
        // Switch to active inventory tab to see the newly added item
        setActiveTab("inventory");
      } else {
        alert(data.detail || "Failed to add inventory item.");
      }
    } catch (err) {
      console.error("Failed to add inventory item:", err);
    }
  };

  const handleSavePredictionToInventory = () => {
    if (!result) return;
    setInvName(result.food);
    setInvStatus(result.freshness);
    setInvQty("1 unit");
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

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <button 
            className={`sidebar-nav-item ${activeTab === "scanner" ? "active" : ""}`}
            onClick={() => setActiveTab("scanner")}
          >
            <span className="nav-icon">🔍</span> Freshness Scanner
          </button>
          <button 
            className={`sidebar-nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("analytics");
              fetchInsights();
            }}
          >
            <span className="nav-icon">📊</span> Freshness Analytics
          </button>
          <button 
            className={`sidebar-nav-item ${activeTab === "shelf_life" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("shelf_life");
              if (!simResult) runShelfLifeSimulation();
            }}
          >
            <span className="nav-icon">🧠</span> Shelf-Life Engine
          </button>
          <button 
            className={`sidebar-nav-item ${activeTab === "storage_monitoring" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("storage_monitoring");
              fetchStorageZones();
            }}
          >
            <span className="nav-icon">🌡️</span> Storage Workflows
          </button>
          <button 
            className={`sidebar-nav-item ${activeTab === "recommendations" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("recommendations");
              fetchRecommendations();
            }}
          >
            <span className="nav-icon">💡</span> Recommendations & FEFO
          </button>
          <button 
            className={`sidebar-nav-item ${activeTab === "spoilage" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("spoilage");
              fetchSpoilageAlerts();
            }}
          >
            <span className="nav-icon">⚠️</span> Spoilage Alerts
            {spoilageStats.total_alerts > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: spoilageStats.critical_count > 0 ? '#ef4444' : '#f59e0b',
                color: 'white',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '100px'
              }}>
                {spoilageStats.total_alerts}
              </span>
            )}
          </button>
          <button 
            className={`sidebar-nav-item ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            <span className="nav-icon">📦</span> Active Inventory
          </button>
          <button 
            className={`sidebar-nav-item ${activeTab === "register_food" ? "active" : ""}`}
            onClick={() => setActiveTab("register_food")}
          >
            <span className="nav-icon">➕</span> Register Item
          </button>
          <button 
            className={`sidebar-nav-item ${activeTab === "storage_compliance" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("storage_compliance");
              fetchStorageSettings();
            }}
          >
            <span className="nav-icon">❄️</span> Cold-Chain Settings
          </button>
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
              <span className="topbar-breadcrumb-parent">Dashboard</span>
              <span className="topbar-breadcrumb-sep">/</span>
              <span className="topbar-breadcrumb-current">
                {activeTab === "scanner" && "Freshness Scanner"}
                {activeTab === "analytics" && "Freshness Analytics"}
                {activeTab === "shelf_life" && "Shelf-Life Engine"}
                {activeTab === "storage_monitoring" && "Storage Monitoring"}
                {activeTab === "recommendations" && "Recommendations & FEFO"}
                {activeTab === "spoilage" && "Spoilage Alerts"}
                {activeTab === "inventory" && "Active Inventory"}
                {activeTab === "register_food" && "Register Item"}
                {activeTab === "storage_compliance" && "Cold-Chain Settings"}
              </span>
            </div>
            <div className="topbar-right">
              <div className="topbar-status-badge">
                <span className="status-dot-pulse"></span>
                <span>{dbStatus.connected ? "Atlas Connected" : "System Active"}</span>
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
                  <form onSubmit={handleAddInventory} className="auth-form" style={{ gap: '20px' }}>
                    {/* Food Item Image Upload */}
                    <div className="input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--gray-800)' }}>
                          Food Item Image <span style={{ fontWeight: 500, color: 'var(--gray-500)', fontSize: '12px' }}>(Optional)</span>
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
                            border: '2px dashed var(--gray-300)',
                            borderRadius: '14px',
                            padding: '24px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            background: 'var(--gray-50)',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.background = '#f0fdf4';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--gray-300)';
                            e.currentTarget.style.background = 'var(--gray-50)';
                          }}
                        >
                          <span style={{ fontSize: '36px' }}>
                            {invName.trim() ? getFoodVisual(invName, invCategory).emoji : '📸'}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark-green)' }}>
                            {invName.trim() 
                              ? `Selected Food Icon: ${getFoodVisual(invName, invCategory).emoji} (Or click to upload photo)`
                              : 'Upload Food Item Image'}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                            {invName.trim() 
                              ? 'Automatic smart food icon applied if no photo is uploaded'
                              : 'Click to browse or drag & drop (JPG, PNG, WEBP)'}
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
                      <label htmlFor="inv-name">Food Item Name</label>
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
                        <label htmlFor="inv-category">Category</label>
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
                        <label htmlFor="inv-qty">Quantity / Unit</label>
                        <input
                          type="text"
                          id="inv-qty"
                          value={invQty}
                          onChange={(e) => setInvQty(e.target.value)}
                          placeholder="e.g. 5 pcs, 2 lbs"
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="input-group">
                        <label htmlFor="inv-status">Freshness Status</label>
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
                        <label htmlFor="inv-storage">Storage Condition</label>
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
                      <label htmlFor="inv-expiry">Expiry Date</label>
                      <input
                        type="date"
                        id="inv-expiry"
                        value={invExpiry}
                        onChange={(e) => setInvExpiry(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
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
                                <span>🗓️</span> Expiry: <strong style={{ color: 'var(--gray-800)' }}>{item.expiry}</strong>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
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
                                    background: '#ffffff',
                                    fontWeight: 600,
                                    color: 'var(--gray-800)',
                                    cursor: 'pointer'
                                  }}
                                  title="Update freshness status"
                                >
                                  <option value="Fresh">Fresh</option>
                                  <option value="Good">Good</option>
                                  <option value="Acceptable">Acceptable</option>
                                  <option value="Near Spoilage">Near Spoilage</option>
                                  <option value="Spoiled">Spoiled</option>
                                  <option value="Quarantined">Quarantined</option>
                                  <option value="Disposed">Disposed</option>
                                </select>
                              </div>

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
                      disabled={settingsSaving}
                      style={{ marginTop: '10px' }}
                    >
                      {settingsSaving ? "Saving Settings..." : "💾 Save Storage Settings"}
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
              <section className="intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2>📊 Freshness Analytics & Inventory Intelligence</h2>
                  <p>
                    Continuous predictive intelligence on inventory health, degradation velocity, spoilage risk exposure, and sustainability impact.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={fetchInsights}
                    disabled={insightsLoading}
                    className="auth-btn"
                    style={{ margin: 0, padding: '10px 18px', width: 'auto', background: 'var(--gray-700)', fontSize: '13px' }}
                  >
                    {insightsLoading ? "Refreshing..." : "🔄 Refresh Intelligence"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="auth-btn"
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
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
              <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--dark-green)' }}>
                    ⚡ Top Priority FEFO Intervention Queue
                  </h3>
                  <button 
                    onClick={() => setActiveTab("recommendations")}
                    className="auth-btn"
                    style={{ margin: 0, padding: '6px 14px', width: 'auto', fontSize: '12px', background: 'var(--primary)' }}
                  >
                    View Full Dispatch Engine →
                  </button>
                </div>

                {insightsData?.urgent_interventions && insightsData.urgent_interventions.length > 0 ? (
                  <div className="spoilage-table-container">
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
                                style={{ background: 'var(--primary-light)', color: 'var(--dark-green)', border: '1px solid var(--primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Apply Action Plan
                              </button>
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
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--dark-green)' }}>
                      🔬 Simulation Parameters
                    </h3>

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
                              cursor: 'pointer'
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
                        onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                        onMouseUp={() => runShelfLifeSimulation()}
                        onTouchEnd={() => runShelfLifeSimulation()}
                        className="sim-slider"
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
                              cursor: 'pointer'
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
                        onChange={(e) => setSimRh(parseFloat(e.target.value))}
                        onMouseUp={() => runShelfLifeSimulation()}
                        onTouchEnd={() => runShelfLifeSimulation()}
                        className="sim-slider"
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
                        onChange={(e) => setSimEthylene(parseFloat(e.target.value))}
                        onMouseUp={() => runShelfLifeSimulation()}
                        onTouchEnd={() => runShelfLifeSimulation()}
                        className="sim-slider"
                      />
                    </div>

                    <button
                      onClick={() => runShelfLifeSimulation()}
                      disabled={simLoading}
                      className="auth-btn"
                      style={{ marginTop: '6px', background: 'var(--dark-green)' }}
                    >
                      {simLoading ? "Calculating Kinetics..." : "⚡ Recalculate Shelf Life"}
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
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                          Automated Mitigation Triggers:
                        </span>
                        <div className="zone-workflow-actions">
                          <button
                            onClick={() => handleExecuteWorkflow(zone.zone_id, "COOLING_BOOST")}
                            disabled={workflowActionLoading === `${zone.zone_id}-COOLING_BOOST`}
                            className="wf-action-btn primary"
                            title="Boost high-output compressor chill"
                          >
                            ❄️ Boost Chill
                          </button>
                          <button
                            onClick={() => handleExecuteWorkflow(zone.zone_id, "AIR_PURGE")}
                            disabled={workflowActionLoading === `${zone.zone_id}-AIR_PURGE`}
                            className="wf-action-btn"
                            title="Activate ethylene catalytic air scrubber"
                          >
                            💨 Gas Purge
                          </button>
                          <button
                            onClick={() => handleExecuteWorkflow(zone.zone_id, "HUMIDITY_OPTIMIZE")}
                            disabled={workflowActionLoading === `${zone.zone_id}-HUMIDITY_OPTIMIZE`}
                            className="wf-action-btn"
                            title="Calibrate ultrasonic humidity injection"
                          >
                            💧 Calibrate RH
                          </button>
                          <button
                            onClick={() => handleExecuteWorkflow(zone.zone_id, "RESET_NORMAL")}
                            disabled={workflowActionLoading === `${zone.zone_id}-RESET_NORMAL`}
                            className="wf-action-btn"
                            title="Reset zone to baseline configuration"
                          >
                            🔄 Reset
                          </button>
                        </div>
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