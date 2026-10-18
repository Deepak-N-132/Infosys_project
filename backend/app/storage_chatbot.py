"""
AI Food Storage & Preservation Advisor Engine
Powered by Google Gemini AI (with automated fallback to extensive Food Science Knowledge Base).
Provides expert shelf-life extension protocols, optimal temperature/humidity envelopes,
ethylene gas isolation guidelines, and spoilage prevention hacks.
"""

import os
import re
from pathlib import Path
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

# Pre-load environment variables from project and backend .env files
_current_dir = Path(__file__).resolve().parent
_backend_dir = _current_dir.parent
_root_dir = _backend_dir.parent
for _env_file in [_backend_dir / ".env", _root_dir / ".env"]:
    if _env_file.exists():
        try:
            load_dotenv(dotenv_path=_env_file, override=False)
        except Exception:
            pass

# Try importing the Google GenAI SDK (google-genai)
try:
    from google import genai  # pyright: ignore[reportAttributeAccessIssue]
    from google.genai import types  # pyright: ignore[reportAttributeAccessIssue]
    GENAI_AVAILABLE = True
except (ImportError, AttributeError):
    genai = None  # type: ignore
    types = None  # type: ignore
    GENAI_AVAILABLE = False


SYSTEM_PROMPT = """You are FreshKeeper AI, an expert food preservation scientist and kitchen storage advisor.
Your mission is to provide accurate, scientifically grounded, and practical food storage guidance to help users keep groceries fresh longer, eliminate food waste, and maintain safety and nutritional quality.

CORE RESPONSE PRINCIPLES:
1. ALWAYS DIRECTLY ANSWER THE USER'S SPECIFIC QUESTION:
   - If the user asks a specific or situational question (e.g., "Can I freeze milk?", "Why are my potatoes turning green?", "Is my food safe to eat if it smells sour?", "How do I thaw frozen chicken?"):
     Directly, clearly, and concisely answer that exact question FIRST. Provide the scientific explanation and practical actionable advice. Do NOT dump an unprompted 6-point storage template for unrelated properties.
   - If the user asks for a comprehensive storage guide or protocol (e.g., "How to store bananas?", "What is the best way to keep spinach fresh?"):
     Provide structured, step-by-step guidance covering:
     • Optimal temperature (°C and °F) and storage zone (crisper, bottom shelf, counter, dark pantry)
     • Moisture and airflow management
     • Ethylene gas sensitivity or emissions (what to isolate from)
     • 2-3 high-impact longevity hacks (e.g., stem wrapping, paper towels, vinegar rinse)
     • Standard vs extended shelf-life expectations
     • Spoilage warning signs & whether freezing is recommended
   - If the user greets or engages in conversation (e.g., "hi", "hello", "who are you?", "what can you do?"):
     Respond in a warm, welcoming, and concise tone. Explain briefly how you can help them extend grocery shelf-life, prevent spoilage, and answer food storage questions.
   - If the food safety risk is high (e.g., fuzzy mold on porous bread, meat left out overnight, rotten odors):
     Explicitly warn the user about health hazards and advise safe disposal.

2. ACCURACY & CONVERSATIONAL CONTINUITY:
   - Pay attention to conversation history. If the user asks follow-up questions (e.g., "Can I freeze it?", "How long does it last there?"), resolve the pronouns and context from previous turns accurately.
   - Use clean, well-structured GitHub-flavored Markdown with bold key terms and bullet points for effortless readability.
"""

# Extensive Offline Food Science Knowledge Base
OFFLINE_FOOD_KNOWLEDGE: Dict[str, Dict[str, Any]] = {
    "banana": {
        "food": "Banana",
        "optimal_temp": "12°C - 14°C (Cool room temperature) or Refrigerated after ripening",
        "humidity": "Moderate (60% - 70%)",
        "ethylene": "High Ethylene Producer. Keep away from apples, avocados, leafy greens.",
        "shelf_life_standard": "3 - 5 days on open counter",
        "shelf_life_extended": "10 - 14 days with crown wrapping & post-ripening refrigeration",
        "quick_hacks": [
            "Wrap the crown/stem tightly with aluminum foil or plastic wrap to block ethylene gas release.",
            "Separate bananas from the bunch to slow down mutual ripening.",
            "Once yellow with slight spots, move to the refrigerator: the skin will darken to brown, but the interior flesh stays firm and fresh for up to 10 more days.",
            "Peel and slice overripe bananas, then freeze in airtight freezer bags for smoothies or baking for up to 6 months."
        ],
        "spoilage_signs": "Liquid seepage, strong fermented/alcoholic odor, black mushy flesh, visible mold around the stem."
    },
    "apple": {
        "food": "Apple",
        "optimal_temp": "0°C - 4°C (Refrigerator crisper drawer)",
        "humidity": "High humidity (85% - 90%)",
        "ethylene": "Very High Ethylene Producer. Isolate from greens, carrots, and potatoes.",
        "shelf_life_standard": "1 - 2 weeks on room temperature counter",
        "shelf_life_extended": "6 - 8 weeks in refrigerator crisper drawer with damp cloth",
        "quick_hacks": [
            "Store in the crisper drawer inside a perforated plastic bag to maintain high humidity without trapping condensation.",
            "Inspect weekly and remove any bruised apple immediately ('one bad apple spoils the bunch' due to accelerated ethylene release).",
            "Keep away from leafy vegetables, broccoli, and carrots which turn bitter when exposed to apple ethylene.",
            "Store one apple with stored potatoes to actually inhibit potato sprouting!"
        ],
        "spoilage_signs": "Extensive brown mushy bruising, wrinkled leathery skin with hollow sound, alcoholic cider-like smell, mold core."
    },
    "orange": {
        "food": "Orange & Citrus",
        "optimal_temp": "4°C - 7°C (Refrigerator crisper drawer)",
        "humidity": "Moderate to High (80% - 85%)",
        "ethylene": "Low Ethylene Producer; moderately sensitive to external ethylene.",
        "shelf_life_standard": "1 week at room temperature",
        "shelf_life_extended": "3 - 4 weeks in refrigerator crisper drawer in mesh bag",
        "quick_hacks": [
            "Keep in a breathable mesh bag; avoid closed plastic bags which trap moisture and breed blue-green Penicillium mold.",
            "Do not wash citrus until right before eating; surface moisture drastically accelerates fungal decay.",
            "If storing at room temperature, keep in a single layer with good air circulation away from direct sunlight.",
            "Juice and zest excess oranges, then freeze in ice cube trays for up to 6 months."
        ],
        "spoilage_signs": "Soft sunken spots, powdery white or blue-green mold spores, mushy fermented skin."
    },
    "tomato": {
        "food": "Tomato",
        "optimal_temp": "12°C - 15°C (Cool counter, stem-side down) until fully ripe",
        "humidity": "Moderate (65% - 75%)",
        "ethylene": "Moderate Ethylene Producer. Emits ethylene as it turns from green to red.",
        "shelf_life_standard": "3 - 5 days on warm counter",
        "shelf_life_extended": "7 - 10 days on cool counter stem-side down; up to 14 days once refrigerated after peak ripeness",
        "quick_hacks": [
            "Store unripe/firm tomatoes at room temperature STEM-SIDE DOWN on a flat tray to prevent moisture loss and bacteria entry.",
            "Never refrigerate unripe tomatoes: temperatures below 10°C permanently destroy flavor volatiles (Z-3-hexenal) and create a mealy texture.",
            "Once fully ripe, move to the refrigerator to halt decay; bring back to room temperature 30 minutes before serving for restored flavor.",
            "Core and freeze whole ripe tomatoes on a baking sheet: skins slip off easily under warm water for sauces!"
        ],
        "spoilage_signs": "Wrinkled collapsing skin, dark sunken water spots, mold on stem scar, sour fermented odor."
    },
    "strawberry": {
        "food": "Strawberry & Berries",
        "optimal_temp": "0°C - 2°C (Coldest refrigerator shelf, NOT crisper)",
        "humidity": "High humidity, but zero direct water droplet condensation",
        "ethylene": "Very Low Producer; sensitive to fungal spores (Botrytis cinerea).",
        "shelf_life_standard": "2 - 3 days in commercial clamshell",
        "shelf_life_extended": "7 - 10 days with hot water/vinegar bath & dry paper towel storage",
        "quick_hacks": [
            "Vinegar Wash Technique: Soak unwashed berries for 3 minutes in 1 part white vinegar to 3 parts water. Rinse with cold water, dry COMPLETELY on paper towels, and store.",
            "Line a glass container with paper towels; place berries in a single uncrowded layer with the lid loosely vented.",
            "Never remove the green caps (calyx) until immediately before consumption; removing them opens a pathway for bacterial ingress.",
            "Flash-freeze on a parchment-lined baking sheet for 2 hours, then transfer to a vacuum-sealed bag for 10-12 months."
        ],
        "spoilage_signs": "Grey fuzzy mold, soft collapsing weeping berries, darkened bruised skin, fermented smell."
    },
    "potato": {
        "food": "Potato",
        "optimal_temp": "7°C - 10°C (Cool, pitch-dark, well-ventilated pantry/cellar)",
        "humidity": "Moderate to High (85% - 90%)",
        "ethylene": "Sensitive to Ethylene. Emits low amounts.",
        "shelf_life_standard": "1 - 2 weeks in warm bright kitchen",
        "shelf_life_extended": "2 - 3 months in dark ventilated crate/burlap",
        "quick_hacks": [
            "Keep in complete darkness: exposure to light triggers chlorophyll and toxic solanine glycoalkaloids (green skin).",
            "Store in a breathable paper bag, cardboard box, or burlap sack; never in sealed plastic.",
            "CRITICAL: Keep potatoes away from onions! Onions emit ethylene and moisture that cause potatoes to sprout within days.",
            "Do NOT refrigerate raw potatoes: cold converts starches into reducing sugars (cold-induced sweetening), which produce carcinogenic acrylamide when fried or roasted."
        ],
        "spoilage_signs": "Extensive soft wrinkly texture, long sprouts, widespread green skin beneath peel, foul rot odor."
    },
    "onion": {
        "food": "Onion & Garlic",
        "optimal_temp": "10°C - 15°C (Dry, cool, dark, well-ventilated location)",
        "humidity": "Low humidity (65% - 70%) to prevent root emergence",
        "ethylene": "Low Producer; sensitive to moisture.",
        "shelf_life_standard": "2 - 3 weeks on counter",
        "shelf_life_extended": "2 - 3 months in mesh hanging bags or nylon pantyhose",
        "quick_hacks": [
            "Store in mesh produce bags, wire baskets, or hanging stockings with a knot tied between each onion for 360-degree airflow.",
            "Keep in a dry environment: high moisture triggers root growth and neck rot (Botrytis allii).",
            "Never store next to potatoes; the moisture from potatoes accelerates onion decay.",
            "For half-used cut onions: store cut-side down in an airtight glass container in the fridge for up to 7 days."
        ],
        "spoilage_signs": "Soft neck or center, dark black mold (Aspergillus niger) under papery skin, offensive pungent odor."
    },
    "leafy_greens": {
        "food": "Leafy Greens (Lettuce, Spinach, Kale)",
        "optimal_temp": "1°C - 4°C (Refrigerator crisper drawer on high humidity)",
        "humidity": "High humidity (90% - 95%) with condensation absorption",
        "ethylene": "Extremely Sensitive to Ethylene. Turns yellow and wilts quickly.",
        "shelf_life_standard": "3 - 5 days in grocery store plastic bag",
        "shelf_life_extended": "10 - 14 days with paper towel moisture cushion in airtight glass container",
        "quick_hacks": [
            "The Paper Towel Trick: Place clean dry paper towels at the bottom, middle, and top of an airtight container to wick away free moisture.",
            "Revive wilted greens: Submerge limp leaves in an ice-water bath for 15 minutes to re-turgidize plant cells through osmosis.",
            "Keep far away from apples, bananas, and tomatoes; ethylene destroys chlorophyll rapidly, turning greens yellow and slimy.",
            "For hardy greens like kale and chard: trim stem ends and store upright like flowers in 1 inch of water."
        ],
        "spoilage_signs": "Brown watery slime, liquefied leaf margins, putrid sulfur odor."
    },
    "cucumber": {
        "food": "Cucumber",
        "optimal_temp": "10°C - 12°C (Warmer part of fridge like middle shelf or door)",
        "humidity": "High humidity (90%)",
        "ethylene": "Highly Ethylene-Sensitive. Will yellow and decay near ripening fruit.",
        "shelf_life_standard": "3 - 5 days in standard fridge",
        "shelf_life_extended": "10 - 14 days wrapped individually in paper towels",
        "quick_hacks": [
            "Wrap each cucumber individually in a dry paper towel, then place them together in an unsealed zip-top bag in the warmest section of your fridge.",
            "Avoid chilling injury: temperatures below 7°C cause water-soaked pitting, soft rot, and translucent flesh.",
            "Keep far away from tomatoes, melons, and bananas.",
            "Slice leftover cucumber and submerge in cold water in an airtight container for up to 48 hours."
        ],
        "spoilage_signs": "Soft squishy sunken pits, slimy skin, yellow discoloration, sour odor."
    },
    "bread": {
        "food": "Bread & Bakery",
        "optimal_temp": "Room temperature (20°C - 22°C) or Frozen (-18°C)",
        "humidity": "Dry to Moderate",
        "ethylene": "Non-reactive.",
        "shelf_life_standard": "3 - 5 days on counter in plastic bag",
        "shelf_life_extended": "3 - 4 months sliced in freezer; 5 - 7 days in bread box",
        "quick_hacks": [
            "NEVER refrigerate fresh bread: starch retrogradation (recrystallization of amylopectin) occurs 6x faster at refrigerator temps (4°C), making bread go stale rapidly.",
            "Store crusty artisanal bread cut-side down on a wooden cutting board or in a paper bag for the first 2 days.",
            "Use a ceramic or wooden bread box for optimal balance between air circulation and moisture retention.",
            "Freeze sliced bread in a freezer bag: toast slices directly from frozen for fresh-baked taste in minutes!"
        ],
        "spoilage_signs": "Visible green/white/black mold spots (Penicillium/Rhizopus), yeasty alcoholic odor."
    },
    "milk": {
        "food": "Milk & Dairy",
        "optimal_temp": "1°C - 3°C (Back of lowest refrigerator shelf)",
        "humidity": "N/A (Sealed container)",
        "ethylene": "Non-reactive.",
        "shelf_life_standard": "5 - 7 days after opening on fridge door",
        "shelf_life_extended": "10 - 14 days stored on back interior shelf; up to 3 months frozen",
        "quick_hacks": [
            "NEVER store milk on the refrigerator door: temperature fluctuates up to 8°C each time the door opens, accelerating lactic acid bacteria.",
            "Store in the deepest part of the bottom shelf where temperatures are coldest and most stable.",
            "Keep container sealed tightly to avoid absorbing strong refrigerator odors (like onions or fish).",
            "Freeze milk in its jug with 2 inches of headspace for expansion; thaw in the fridge for 24-36 hours and shake well before drinking."
        ],
        "spoilage_signs": "Sour curdling, lumpy texture, sour acetic smell, yellowish discoloration."
    },
    "cheese": {
        "food": "Cheese (Hard vs Soft)",
        "optimal_temp": "2°C - 5°C (Cheese/deli drawer or vegetable crisper)",
        "humidity": "High humidity (80% - 85%)",
        "ethylene": "Non-reactive.",
        "shelf_life_standard": "1 - 2 weeks wrapped in plastic cling film",
        "shelf_life_extended": "4 - 8 weeks for hard cheese wrapped in wax/parchment paper",
        "quick_hacks": [
            "Avoid plastic cling film: suffocates cheese and traps moisture, creating an ideal breeding ground for undesirable surface molds.",
            "Wrap in parchment or wax paper first, then loosely wrap in foil or place in an unsealed container so the cheese can breathe without drying out.",
            "Hard cheeses (Parmesan, Cheddar): if surface mold appears, cut 1 inch around and below the mold spot; the rest remains safe to eat.",
            "Soft cheeses (Brie, Ricotta, Mozzarella): discard immediately if mold appears as spores penetrate throughout soft curds."
        ],
        "spoilage_signs": "Slime on soft cheese, pink or grey fuzzy mold on soft varieties, strong ammonia/rancid odor."
    },
    "meat_chicken": {
        "food": "Chicken & Poultry",
        "optimal_temp": "0°C - 2°C (Lowest refrigerator shelf, coldest spot) or -18°C frozen",
        "humidity": "N/A (Sealed)",
        "ethylene": "Non-reactive.",
        "shelf_life_standard": "1 - 2 days in refrigerator in original store packaging",
        "shelf_life_extended": "9 - 12 months vacuum-sealed in freezer",
        "quick_hacks": [
            "Store on the absolute lowest shelf of the refrigerator in a rimmed tray/plate to prevent accidental raw juices dripping onto other foods.",
            "If not cooking within 48 hours of purchase, freeze immediately.",
            "For freezing: remove grocery plastic wrap, wrap tightly in freezer paper or heavy aluminum foil, then seal in a zip-top freezer bag with air pressed out to prevent freezer burn.",
            "Thaw strictly in the refrigerator (never on the counter) allowing 24 hours per 5 lbs of poultry."
        ],
        "spoilage_signs": "Slimy tacky film that doesn't rinse off, dull greyish or greenish hue, pungent sulfurous or ammonia odor."
    },
    "fish": {
        "food": "Fresh Fish & Seafood",
        "optimal_temp": "0°C - 1°C (Directly on an ice bed in the refrigerator)",
        "humidity": "High (moist ice contact without soaking in meltwater)",
        "ethylene": "Non-reactive.",
        "shelf_life_standard": "1 - 2 days in standard refrigerator",
        "shelf_life_extended": "3 - 4 days packed in an ice bath in the fridge; 4 - 6 months frozen",
        "quick_hacks": [
            "The Colander Ice Bed Method: Place fish fillets in a zip-top bag on top of ice cubes in a colander set inside a bowl in the fridge; empty meltwater daily.",
            "Pat fillets completely dry with paper towels before storing to inhibit psychrophilic bacteria.",
            "Vacuum seal before freezing to completely block oxidation of delicate omega-3 fats.",
            "Brush whole fish with a light coat of water and freeze, creating an ice glaze shield against freezer burn."
        ],
        "spoilage_signs": "Strong fishy or ammonia odor, milky white slime on skin/gills, dull sunken cloudy eyes, soft flesh that does not spring back."
    },
    "avocado": {
        "food": "Avocado",
        "optimal_temp": "Room temp (18°C - 22°C) until ripe; 4°C - 6°C once ripe",
        "humidity": "Moderate (65%)",
        "ethylene": "High Ethylene Producer and highly responsive to ethylene.",
        "shelf_life_standard": "2 - 3 days at peak ripeness on counter",
        "shelf_life_extended": "7 - 10 days stored in refrigerator once gently yielding to touch",
        "quick_hacks": [
            "To ripen quickly: place firm avocado in a closed brown paper bag with a banana or apple; the trapped ethylene gas ripens it in 24-48 hours.",
            "Once ripe, immediately transfer to the refrigerator to pause enzymatic softening for up to 7-10 days.",
            "For cut avocado halves: keep the pit in, brush surface with lemon/lime juice or olive oil, and press plastic wrap directly against the flesh to prevent polyphenol oxidase browning.",
            "Store cut avocado alongside sliced red onion in an airtight container: sulfur compounds prevent browning without touching the avocado!"
        ],
        "spoilage_signs": "Dark stringy brown/black interior, rancid squash-like odor, loose hollow skin, mold beneath stem button."
    },
    "carrot": {
        "food": "Carrots",
        "optimal_temp": "0°C - 4°C (Refrigerator crisper drawer)",
        "humidity": "Very High (95% - 98%)",
        "ethylene": "Extremely Sensitive to Ethylene. Turns intensely bitter when exposed.",
        "shelf_life_standard": "1 - 2 weeks in grocery bag",
        "shelf_life_extended": "4 - 6 weeks submerged in water or wrapped in damp towels",
        "quick_hacks": [
            "Remove green tops immediately upon purchase: greens draw moisture out of the root, turning carrots limp and rubbery within 48 hours.",
            "Submerged Water Storage: Place whole peeled or unpeeled carrots in a sealed container filled with cold fresh water in the fridge; change water every 4-5 days for crispness up to 1 month.",
            "Keep strictly away from ethylene producers (apples, melons, pears) which trigger isocoumarin synthesis (bitter taste).",
            "Store unwashed in a plastic bag with a paper towel to regulate moisture if not using water immersion."
        ],
        "spoilage_signs": "Soft rubbery bendiness, slimy translucent coating, white blush that turns into black sunken rot."
    },
    "herbs": {
        "food": "Fresh Herbs (Cilantro, Parsley, Basil)",
        "optimal_temp": "Parsley/Cilantro/Dill: 1°C - 4°C (Fridge); Basil: 10°C - 15°C (Room Temp counter)",
        "humidity": "High humidity around leaves with stems in water",
        "ethylene": "Sensitive to Ethylene.",
        "shelf_life_standard": "3 - 5 days in plastic produce bag",
        "shelf_life_extended": "2 - 3 weeks stored like cut flowers in water",
        "quick_hacks": [
            "Bouquet Method: Trim 1/2 inch off the stems, place upright in a glass jar with 1 inch of water, and loosely drape a plastic bag over the top.",
            "Store Parsley, Cilantro, and Mint in the refrigerator; store BASIL at ROOM TEMPERATURE on the counter (refrigeration turns basil leaves black due to chilling injury).",
            "Woody Herbs (Rosemary, Thyme, Oregano): Wrap loosely in a damp paper towel and seal in a zip-top bag in the crisper drawer.",
            "Chop excess herbs and freeze in olive oil in ice cube trays for instant cooking bases lasting 6 months."
        ],
        "spoilage_signs": "Dark slimy blackened leaves, watery decomposition, unpleasant putrid odor."
    },
    "egg": {
        "food": "Eggs",
        "optimal_temp": "1°C - 4°C (Middle/bottom refrigerator shelf, NEVER the door)",
        "humidity": "Moderate (70% - 80%)",
        "ethylene": "Non-reactive.",
        "shelf_life_standard": "3 - 5 weeks in refrigerator in carton",
        "shelf_life_extended": "Up to 1 year beaten with salt/sugar in freezer",
        "quick_hacks": [
            "Keep in their original cardboard carton: paperboard absorbs shocks and blocks porous eggshells from absorbing odors from pungent foods.",
            "Never store on the refrigerator door: temperature swings every time door opens promote condensation and allow bacteria to enter egg pores.",
            "The Water Float Test: Fresh eggs sink and lie flat on the bottom; older eggs tilt upward; bad eggs float to the surface as moisture evaporates and air pocket grows.",
            "To freeze: crack into a bowl, gently whisk yolks and whites with 1/8 tsp salt (or 1 tsp sugar) per 4 eggs to prevent gelatinization, and freeze in airtight containers."
        ],
        "spoilage_signs": "Sulfuric rotten odor upon cracking, pink/green/iridescent discoloration (Pseudomonas), black mold spots inside shell."
    },
    "mushroom": {
        "food": "Mushrooms",
        "optimal_temp": "1°C - 4°C (Middle refrigerator shelf, NOT crisper)",
        "humidity": "Breathable dry environment (avoid trapped moisture)",
        "ethylene": "Low sensitivity.",
        "shelf_life_standard": "3 - 5 days in grocery plastic clamshell",
        "shelf_life_extended": "7 - 10 days in a brown paper bag",
        "quick_hacks": [
            "Immediately transfer from grocery plastic into a brown paper bag: paper absorbs excess condensation while allowing airflow.",
            "NEVER wash mushrooms before storing: mushrooms are 90% water and act like sponges, rotting within 24 hours of moisture exposure.",
            "Avoid the high-humidity crisper drawer: crispers trap too much humidity and cause mushrooms to turn slimy.",
            "To freeze: slice and sauté in a little butter or oil until browned, then freeze in airtight bags for up to 6 months."
        ],
        "spoilage_signs": "Slimy slippery surface, dark sunken soft spots, shriveled dried caps, foul or fishy odor."
    },
    "rice_grains": {
        "food": "Cooked Rice & Grains",
        "optimal_temp": "Cooked: 1°C - 3°C (Fridge); Raw: Room temp dry pantry (15°C - 20°C)",
        "humidity": "Airtight seal",
        "ethylene": "Non-reactive.",
        "shelf_life_standard": "1 - 2 days cooked at room temp (Hazardous!)",
        "shelf_life_extended": "3 - 4 days cooked in fridge; 3 - 6 months frozen",
        "quick_hacks": [
            "CRITICAL BACTERIAL RULE (Bacillus cereus): Cool cooked rice within 1 hour and refrigerate immediately; leaving warm rice on counter produces heat-resistant emetic toxins.",
            "Spread hot cooked rice in a shallow container so it cools rapidly to below 4°C without warming the fridge.",
            "Always reheat thoroughly until piping hot (at least 74°C / 165°F) throughout, and never reheat cooked rice more than once.",
            "Freeze cooked rice in single-serving freezer bags: microwave directly from frozen with a splash of water for freshly steamed texture."
        ],
        "spoilage_signs": "Slimy sticky residue between grains, sour fermented odor, pink/white bacterial discoloration."
    },
    "watermelon_melon": {
        "food": "Melons & Watermelon",
        "optimal_temp": "Whole: 10°C - 15°C (Counter); Cut: 1°C - 4°C (Refrigerator)",
        "humidity": "High (85% - 90%)",
        "ethylene": "Cantaloupe/honeydew emit high ethylene; watermelon is sensitive to ethylene.",
        "shelf_life_standard": "Whole: 7 - 10 days; Cut: 2 - 3 days in fridge",
        "shelf_life_extended": "Whole: 2 - 3 weeks; Cut: 5 - 7 days sealed in glass container",
        "quick_hacks": [
            "Store whole uncut watermelon at room temperature: lycopene and antioxidant levels remain highest at ambient room temps.",
            "Once cut, cover exposed surfaces tightly with plastic wrap or transfer cubes into an airtight glass container immediately.",
            "Keep whole cantaloupes separated from sensitive vegetables (greens, carrots, cucumbers).",
            "Freeze watermelon cubes on a baking sheet: blend straight from frozen for sorbet or fruit smoothies lasting 6 months."
        ],
        "spoilage_signs": "Sour fermented effervescent taste, weeping slimy flesh, dark sunken rind spots, collapsed waterlogged texture."
    },
    "grape": {
        "food": "Grapes",
        "optimal_temp": "0°C - 2°C (Back of lowest refrigerator shelf)",
        "humidity": "High (90% - 95%) with airflow",
        "ethylene": "Low sensitivity.",
        "shelf_life_standard": "3 - 5 days on counter",
        "shelf_life_extended": "2 - 3 weeks in refrigerator ventilated bag",
        "quick_hacks": [
            "Do NOT wash grapes until ready to consume: surface moisture triggers Botrytis grey mold rot.",
            "Store in their original perforated plastic bag or ventilated container to allow essential air circulation.",
            "Remove any crushed or damaged grapes immediately so they do not infect neighboring fruit.",
            "Freeze washed, dried grapes on a baking sheet: they make sweet, natural frozen bite-sized treats lasting 6 months."
        ],
        "spoilage_signs": "Brown translucent spots, soft slipping skins, grey fuzzy mold on stems, vinegary odor."
    },
    "broccoli_cauliflower": {
        "food": "Broccoli & Cauliflower",
        "optimal_temp": "0°C - 3°C (Refrigerator crisper drawer)",
        "humidity": "High humidity (90% - 95%)",
        "ethylene": "Extremely Sensitive to Ethylene. Turns yellow and develops bitter off-flavors.",
        "shelf_life_standard": "3 - 5 days in grocery bag",
        "shelf_life_extended": "10 - 14 days wrapped loosely in damp paper towels",
        "quick_hacks": [
            "Store upright like cut flowers: trim 1/2 inch off the stalk and place in a jar with 1 inch of water in the fridge.",
            "Keep loosely wrapped in a damp paper towel inside a perforated bag; avoid airtight sealed bags that trap respiratory heat.",
            "Keep strictly away from apples, bananas, pears, and tomatoes: ethylene rapidly destroys green chlorophyll.",
            "To freeze: cut into florets, blanch in boiling water for 3 minutes, plunge into ice bath, dry, and freeze in vacuum bags for 10-12 months."
        ],
        "spoilage_signs": "Yellowing florets, slimy dark brown patches, rubbery bendy stalks, strong sulfur odor."
    },
    "bell_pepper": {
        "food": "Bell Peppers & Capsicum",
        "optimal_temp": "7°C - 10°C (Crisper drawer with vent half-open)",
        "humidity": "Moderate to High (80% - 90%)",
        "ethylene": "Low sensitivity.",
        "shelf_life_standard": "4 - 7 days in fridge",
        "shelf_life_extended": "14 - 21 days wrapped in dry paper towel in crisper",
        "quick_hacks": [
            "Wrap unwashed peppers in dry paper towels to wick away moisture while preventing dehydration.",
            "Green bell peppers last 1-2 weeks longer than red or yellow peppers because they are picked earlier.",
            "For leftover halves: leave the stem and seeds intact, and store in an airtight container with a paper towel.",
            "Freeze raw: slice into strips and freeze on a sheet pan without blanching; store in freezer bags for cooking up to 9 months."
        ],
        "spoilage_signs": "Wrinkled leathery skin, soft water-soaked pits, black mold inside seed core, slimy surface."
    },
    "cooked_leftovers": {
        "food": "Cooked Meals & Leftovers",
        "optimal_temp": "1°C - 4°C (Refrigerator) or -18°C (Freezer)",
        "humidity": "Airtight seal",
        "ethylene": "Non-reactive.",
        "shelf_life_standard": "1 - 2 days in unsealed bowl",
        "shelf_life_extended": "3 - 4 days in airtight glass container; 2 - 4 months frozen",
        "quick_hacks": [
            "The 2-Hour Rule: Place cooked food into the refrigerator or freezer within 2 hours of cooking (1 hour if room temp > 32°C / 90°F).",
            "Store in shallow airtight containers (less than 2 inches deep) for rapid and uniform cooling below 4°C.",
            "Label containers with the prep date and practice FEFO (First-Expired, First-Out) by placing older dishes in front.",
            "Reheat leftovers to at least 74°C (165°F) throughout before serving, and never reheat the same portion multiple times."
        ],
        "spoilage_signs": "Sour or rancid odor, slimy surface sheen, gas bubbles or swelling lids, fuzzy mold spots."
    }
}


BUILTIN_GEMINI_API_KEY = ""


def get_gemini_api_key() -> str:
    """
    Retrieve Gemini API key from environment, .env file, or system configuration.
    Supports both GEMINI_API_KEY and GOOGLE_API_KEY.
    """
    key = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").strip()
    if key and len(key) > 10 and not key.startswith("your_") and not key.startswith("change-this"):
        return key

    # Reload from base directories
    base_dir = Path(__file__).resolve().parent.parent
    root_dir = base_dir.parent

    for env_path in [base_dir / ".env", root_dir / ".env"]:
        try:
            if env_path.exists():
                load_dotenv(dotenv_path=env_path, override=True)
                key = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").strip()
                if key and len(key) > 10 and not key.startswith("your_") and not key.startswith("change-this"):
                    return key
        except Exception:
            pass

    return BUILTIN_GEMINI_API_KEY


def is_gemini_configured() -> bool:
    """Check if a valid Gemini API key is configured."""
    key = get_gemini_api_key()
    return bool(key and len(key) > 10 and not key.startswith("your_") and not key.startswith("change-this"))


def save_gemini_api_key(new_key: str) -> bool:
    """
    Save the provided Gemini API key into .env files and current environment.
    Synchronizes both GEMINI_API_KEY and GOOGLE_API_KEY.
    """
    cleaned_key = new_key.strip()
    if not cleaned_key:
        return False

    os.environ["GEMINI_API_KEY"] = cleaned_key
    os.environ["GOOGLE_API_KEY"] = cleaned_key

    base_dir = Path(__file__).resolve().parent.parent
    root_dir = base_dir.parent

    for env_path in [base_dir / ".env", root_dir / ".env"]:
        try:
            if env_path.exists():
                content = env_path.read_text(encoding="utf-8")
                if "GEMINI_API_KEY=" in content:
                    content = re.sub(r"GEMINI_API_KEY=.*", f"GEMINI_API_KEY={cleaned_key}", content)
                else:
                    content += f"\nGEMINI_API_KEY={cleaned_key}\n"
                if "GOOGLE_API_KEY=" in content:
                    content = re.sub(r"GOOGLE_API_KEY=.*", f"GOOGLE_API_KEY={cleaned_key}", content)
                env_path.write_text(content, encoding="utf-8")
            else:
                env_path.write_text(f"GEMINI_API_KEY={cleaned_key}\nGOOGLE_API_KEY={cleaned_key}\n", encoding="utf-8")
        except Exception:
            pass

    return True


CANDIDATE_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-flash-latest"
]


def extract_model_response_text(resp: Any) -> str:
    """Extract clean answer text from Gemini/Gemma response, safely handling thought parts."""
    if not resp:
        return ""
    try:
        if hasattr(resp, "candidates") and resp.candidates:
            for cand in resp.candidates:
                if hasattr(cand, "content") and cand.content and hasattr(cand.content, "parts"):
                    non_thought_parts = [
                        p.text for p in cand.content.parts
                        if getattr(p, "text", None) and not getattr(p, "thought", False)
                    ]
                    if non_thought_parts:
                        return "\n\n".join(non_thought_parts).strip()
    except Exception:
        pass

    if getattr(resp, "text", None):
        return resp.text.strip()
    return ""


def test_gemini_api_key(api_key: str) -> Dict[str, Any]:
    """
    Directly tests a Gemini API key against Google GenAI models.
    Returns detailed diagnostics and validity status.
    """
    cleaned_key = (api_key or "").strip()
    if not cleaned_key:
        return {
            "valid": False,
            "error": "API key cannot be empty. Please paste your key from Google AI Studio."
        }

    if len(cleaned_key) < 15 or cleaned_key.startswith("your_") or cleaned_key.startswith("change-this"):
        return {
            "valid": False,
            "error": "API key seems invalid or too short. Valid Google API keys are usually ~39 characters starting with 'AIzaSy'."
        }

    if not GENAI_AVAILABLE or genai is None or types is None:
        return {
            "valid": False,
            "error": "google-genai Python library is not installed in the environment."
        }

    last_error = ""

    try:
        client = genai.Client(api_key=cleaned_key)
        for model in CANDIDATE_MODELS:
            try:
                resp = client.models.generate_content(
                    model=model,
                    contents="Ping. Respond with 'CONNECTED'.",
                    config=types.GenerateContentConfig(
                        temperature=0.1,
                        max_output_tokens=300,
                        automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
                    )
                )
                text = extract_model_response_text(resp)
                if text:
                    return {
                        "valid": True,
                        "model": model,
                        "message": f"Successfully connected to Google Gemini ({model})!",
                        "reply_sample": text
                    }
            except Exception as m_err:
                err_str = str(m_err)
                last_error = err_str
                if "API_KEY_INVALID" in err_str or "API key not valid" in err_str:
                    return {
                        "valid": False,
                        "error": "Google rejected the key: API key is invalid. Please copy your key from Google AI Studio."
                    }
                if "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
                    return {
                        "valid": False,
                        "error": "Google Gemini quota exhausted (429 Resource Exhausted) for this key."
                    }
                continue

        return {
            "valid": False,
            "error": f"Failed to connect to any Gemini model: {last_error}"
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }


def is_greeting(text: str) -> bool:
    """Check if the user message is a general greeting or introduction."""
    clean = re.sub(r"[^\w\s]", "", text.lower().strip())
    words = clean.split()
    greetings = {
        "hi", "hello", "hey", "howdy", "greetings", "good morning",
        "good afternoon", "good evening", "who are you", "what can you do", "help"
    }
    if clean in greetings:
        return True
    if len(words) <= 3 and any(w in {"hi", "hello", "hey"} for w in words):
        return True
    return False


def detect_food_item(text: str) -> Optional[str]:
    """Detect matching food item key from text query with strict whole-word regex matching."""
    if not text:
        return None
    clean = text.lower().strip()

    # Synonym mapping (ordered by specific to general)
    synonyms = {
        "banana": "banana",
        "bananas": "banana",
        "plantain": "banana",
        "apple": "apple",
        "apples": "apple",
        "orange": "orange",
        "oranges": "orange",
        "citrus": "orange",
        "lemon": "orange",
        "lemons": "orange",
        "lime": "orange",
        "limes": "orange",
        "grapefruit": "orange",
        "mandarin": "orange",
        "tangerine": "orange",
        "tomato": "tomato",
        "tomatoes": "tomato",
        "strawberry": "strawberry",
        "strawberries": "strawberry",
        "blueberry": "strawberry",
        "blueberries": "strawberry",
        "raspberry": "strawberry",
        "raspberries": "strawberry",
        "blackberry": "strawberry",
        "blackberries": "strawberry",
        "berry": "strawberry",
        "berries": "strawberry",
        "potato": "potato",
        "potatoes": "potato",
        "spud": "potato",
        "yam": "potato",
        "sweet potato": "potato",
        "onion": "onion",
        "onions": "onion",
        "garlic": "onion",
        "shallot": "onion",
        "shallots": "onion",
        "scallion": "onion",
        "scallions": "onion",
        "leek": "onion",
        "veggie": "leafy_greens",
        "veggies": "leafy_greens",
        "vegetable": "leafy_greens",
        "vegetables": "leafy_greens",
        "greens": "leafy_greens",
        "spinach": "leafy_greens",
        "lettuce": "leafy_greens",
        "kale": "leafy_greens",
        "salad": "leafy_greens",
        "cabbage": "leafy_greens",
        "arugula": "leafy_greens",
        "chard": "leafy_greens",
        "cucumber": "cucumber",
        "cucumbers": "cucumber",
        "zucchini": "cucumber",
        "bread": "bread",
        "toast": "bread",
        "loaf": "bread",
        "sourdough": "bread",
        "bagel": "bread",
        "bagels": "bread",
        "baguette": "bread",
        "pastry": "bread",
        "bun": "bread",
        "buns": "bread",
        "milk": "milk",
        "dairy": "milk",
        "yogurt": "milk",
        "curd": "milk",
        "cream": "milk",
        "cheese": "cheese",
        "cheddar": "cheese",
        "parmesan": "cheese",
        "mozzarella": "cheese",
        "gouda": "cheese",
        "paneer": "cheese",
        "chicken": "meat_chicken",
        "poultry": "meat_chicken",
        "turkey": "meat_chicken",
        "beef": "meat_chicken",
        "meat": "meat_chicken",
        "steak": "meat_chicken",
        "pork": "meat_chicken",
        "mutton": "meat_chicken",
        "lamb": "meat_chicken",
        "fish": "fish",
        "salmon": "fish",
        "tuna": "fish",
        "seafood": "fish",
        "shrimp": "fish",
        "prawn": "fish",
        "prawns": "fish",
        "crab": "fish",
        "cod": "fish",
        "avocado": "avocado",
        "avocados": "avocado",
        "guacamole": "avocado",
        "carrot": "carrot",
        "carrots": "carrot",
        "herbs": "herbs",
        "herb": "herbs",
        "cilantro": "herbs",
        "coriander": "herbs",
        "parsley": "herbs",
        "basil": "herbs",
        "mint": "herbs",
        "dill": "herbs",
        "rosemary": "herbs",
        "egg": "egg",
        "eggs": "egg",
        "mushroom": "mushroom",
        "mushrooms": "mushroom",
        "rice": "rice_grains",
        "cooked rice": "rice_grains",
        "grain": "rice_grains",
        "grains": "rice_grains",
        "pasta": "rice_grains",
        "noodle": "rice_grains",
        "noodles": "rice_grains",
        "oat": "rice_grains",
        "oats": "rice_grains",
        "watermelon": "watermelon_melon",
        "watermelons": "watermelon_melon",
        "melon": "watermelon_melon",
        "cantaloupe": "watermelon_melon",
        "honeydew": "watermelon_melon",
        "grape": "grape",
        "grapes": "grape",
        "broccoli": "broccoli_cauliflower",
        "cauliflower": "broccoli_cauliflower",
        "bell pepper": "bell_pepper",
        "capsicum": "bell_pepper",
        "pepper": "bell_pepper",
        "peppers": "bell_pepper",
        "chili": "bell_pepper",
        "chilli": "bell_pepper",
        "leftover": "cooked_leftovers",
        "leftovers": "cooked_leftovers",
        "soup": "cooked_leftovers",
        "stew": "cooked_leftovers",
        "curry": "cooked_leftovers"
    }

    # Strict whole-word match for synonyms
    for syn, target in synonyms.items():
        pattern = r"\b" + re.escape(syn) + r"\b"
        if re.search(pattern, clean):
            return target

    # Strict whole-word match for OFFLINE_FOOD_KNOWLEDGE keys
    for key in OFFLINE_FOOD_KNOWLEDGE.keys():
        cleaned_key = key.replace("_", " ")
        pattern = r"\b" + re.escape(cleaned_key) + r"\b"
        if re.search(pattern, clean):
            return key

    return None


def extract_potential_food_subject(text: str) -> Optional[str]:
    """Extract candidate food word if unknown (e.g. 'store mango' -> 'mango')."""
    clean = text.lower().strip()
    match = re.search(r"\b(?:store|keep|preserve|freezing|freeze|about|for)\s+([a-zA-Z\s]{3,20})", clean)
    if match:
        candidate = match.group(1).strip()
        # Remove common filler words
        candidate = re.sub(r"\b(my|the|a|an|fresh|some|to|in|how|longer|properly)\b", "", candidate).strip()
        if candidate and len(candidate) > 2:
            return candidate.title()
    return None


def is_storage_guide_query(message: str) -> bool:
    """Check if the user is asking for a full storage guide/protocol rather than a specific Q&A."""
    clean = message.lower()
    keywords = [
        "how to store", "how do i store", "how should i store", "best way to store",
        "how to keep", "storage protocol", "storage guide", "optimal storage",
        "where to store", "where should i keep", "how long do"
    ]
    return any(k in clean for k in keywords)


def get_offline_response(message: str, food_key: Optional[str] = None, gemini_error_notice: Optional[str] = None) -> Dict[str, Any]:
    """
    Build rich offline response from specialized Food Science Knowledge Base,
    handling greetings, specific food science questions, and full food storage guides.
    """
    clean_msg = message.lower().strip()

    # 1. Greetings
    if is_greeting(message):
        welcome_md = """### 🥬 Welcome to FreshKeeper Storage Advisor!

I'm your **AI Food Preservation & Longevity Assistant**. I help you extend the shelf life of groceries by up to 3x using kitchen science:

- **🌡️ Optimal Temperature & Zones**: Which items go in crisper drawers, bottom shelves, or pantry baskets.
- **⚡ Ethylene Management**: Avoid ripening gas cross-contamination that turns greens yellow.
- **💡 Proven Longevity Hacks**: Stem wrapping, paper towel moisture barriers, vinegar washes, and safe freezing.
- **⚠️ Spoilage & Food Safety**: Understand early signs of decay, mold risks, and safe consumption windows.

👉 **Try asking me:**
- *"How do I keep bananas fresh for 5+ extra days?"*
- *"Can I freeze milk or cheese?"*
- *"Why are my potatoes turning green?"*
- *"Why shouldn't potatoes and onions be stored together?"*
- *"Best way to store spinach and leafy greens?"*
"""
        return {
            "success": True,
            "reply": welcome_md,
            "source": "knowledge_base",
            "model": "FreshKeeper-Engine",
            "food_detected": None,
            "specs": None,
            "quick_hacks": [],
            "suggested_questions": [
                "How do I store bananas?",
                "Can I freeze milk or cheese?",
                "How to store leafy greens?"
            ]
        }

    # 2. Targeted Food Science Q&A (Common Questions)
    prefix_note = ""
    if gemini_error_notice:
        prefix_note = f"> ⚠️ **Notice**: *{gemini_error_notice}*\n\n"

    # A. Can I freeze milk?
    if "freeze" in clean_msg and "milk" in clean_msg:
        reply = f"""{prefix_note}### 🥛 Freezing Milk: Safety & Protocol

**Yes, you can safely freeze milk for up to 3 months.**

- **Leave Headspace**: Liquids expand by about 9% when freezing. Pour out at least **1.5 to 2 inches (4-5 cm)** from a full plastic jug before freezing to prevent bursting. Never freeze milk in glass bottles.
- **Thawing Protocol**: Thaw frozen milk in the **refrigerator over 24-48 hours**, never on the counter.
- **Fat Separation**: Freezing causes the milk fat to separate, making it look slightly yellow or grainy. Simply shake the container vigorously before pouring to restore consistency.
- **Best Use**: Previously frozen milk is ideal for cooking, smoothies, baking, and cereal!
"""
        return {
            "success": True,
            "reply": reply,
            "source": "knowledge_base",
            "model": "FreshKeeper-Engine",
            "food_detected": "Milk",
            "specs": None,
            "quick_hacks": ["Leave 2 inches of headspace in plastic jugs", "Thaw slowly in refrigerator only", "Shake vigorously after thawing"],
            "suggested_questions": ["Can I freeze cheese?", "How to store milk in the fridge?", "How long does milk last after opening?"]
        }

    # B. Can I freeze cheese?
    if "freeze" in clean_msg and "cheese" in clean_msg:
        reply = f"""{prefix_note}### 🧀 Freezing Cheese: What Works & What Doesn't

**Yes, but it depends on the type of cheese:**

- **Hard & Semi-Hard Cheeses (Cheddar, Parmesan, Gouda, Mozzarella, Swiss)**:
  - Freeze well for **up to 6 months**.
  - *Pro-Tip*: Grate or shred the cheese first, toss with 1 tsp cornstarch (to prevent clumping), and freeze in freezer bags.
  - *Texture Note*: Freezing breaks down emulsion bonds, making blocks crumbly when sliced. Great for melting and cooking!
- **Soft & Creamy Cheeses (Brie, Camembert, Ricotta, Cream Cheese, Cottage Cheese)**:
  - **Do NOT freeze**: Ice crystal formation separates whey proteins from fat, leaving them watery, curdled, and grainy upon thawing.
"""
        return {
            "success": True,
            "reply": reply,
            "source": "knowledge_base",
            "model": "FreshKeeper-Engine",
            "food_detected": "Cheese",
            "specs": None,
            "quick_hacks": ["Shred hard cheese before freezing for easy melting", "Avoid freezing soft high-moisture cheeses", "Thaw in fridge overnight before using"],
            "suggested_questions": ["How to store cheese to prevent mold?", "Can I freeze bread?", "How to store milk?"]
        }

    # C. Can I freeze bread / should bread go in the fridge?
    if "bread" in clean_msg and any(w in clean_msg for w in ["freeze", "freezer", "fridge", "refrigerator"]):
        reply = f"""{prefix_note}### 🍞 Storing Bread: Freezer vs Refrigerator

**The Golden Rule: Freeze bread, NEVER refrigerate bread!**

1. **Why NEVER the Refrigerator?**
   - Cold refrigerator temperatures (1°C - 4°C) trigger rapid **retrogradation** (recrystallization of gelatinized amylose starches).
   - This makes bread go dry, tough, and **stale up to 6 times faster** than at room temperature!
2. **Why the Freezer Works Wonders:**
   - Freezing halts retrogradation and fungal spore growth completely. Bread preserves its fresh crumb for **up to 6 months**.
3. **Best Freezing Technique:**
   - Pre-slice the loaf before freezing with squares of parchment paper between slices.
   - Pop slices directly from the freezer into the toaster for that fresh-baked crispness!
"""
        return {
            "success": True,
            "reply": reply,
            "source": "knowledge_base",
            "model": "FreshKeeper-Engine",
            "food_detected": "Bread",
            "specs": None,
            "quick_hacks": ["Slice bread before freezing", "Toast directly from frozen", "Never store fresh bread in the refrigerator"],
            "suggested_questions": ["How to store bread at room temperature?", "What to do with stale bread?", "Can I freeze cooked rice?"]
        }

    # D. Can I freeze rice / cooked rice safety
    if "rice" in clean_msg and any(w in clean_msg for w in ["freeze", "safe", "leftover", "store"]):
        reply = f"""{prefix_note}### 🍚 Cooked Rice Safety & Preservation Protocol

**Cooked rice carries unique bacterial safety considerations (*Bacillus cereus*):**

1. **The 1-Hour Cooling Rule**:
   - Spores of *Bacillus cereus* survive boiling. At room temperature, they germinate and produce heat-stable emetic toxins.
   - Cool leftover rice quickly by spreading it on a shallow tray, and transfer to an airtight container in the fridge within **1 hour** of cooking.
2. **Freezing Cooked Rice (Up to 2 Months)**:
   - Cooked rice freezes brilliantly! Portion warm rice into flat zip-top freezer bags while steaming. The trapped steam re-hydrates the grains when reheated.
3. **Reheating**:
   - Reheat until steaming hot throughout (**74°C / 165°F**). Add 1 tablespoon of water per cup of rice and cover when microwaving.
"""
        return {
            "success": True,
            "reply": reply,
            "source": "knowledge_base",
            "model": "FreshKeeper-Engine",
            "food_detected": "Cooked Rice",
            "specs": None,
            "quick_hacks": ["Cool within 1 hour to prevent Bacillus cereus toxins", "Freeze in flat portioned zip-top bags", "Add water before microwaving to restore fluffiness"],
            "suggested_questions": ["How long do cooked leftovers last?", "Can I freeze bread?", "How to store potatoes?"]
        }

    # E. Green potatoes
    if "potato" in clean_msg and any(w in clean_msg for w in ["green", "greening", "toxic", "sprout"]):
        reply = f"""{prefix_note}### 🥔 Why Potatoes Turn Green & Food Safety Guide

**Green patches on potatoes indicate solanine buildup:**

1. **What Causes the Green Color?**
   - Exposure to light triggers chlorophyll production. Alongside chlorophyll, potatoes produce **solanine**, a bitter, toxic glycoalkaloid defense chemical.
2. **Is it Safe to Eat?**
   - **Small green patches**: Cut away the green skin and flesh generously (at least 1/2 inch deep) along with any sprouts. The remaining flesh is safe.
   - **Extensively green potatoes or bitter taste**: **Discard completely.** Ingesting solanine causes stomach cramps, nausea, headaches, and vomiting.
3. **Prevention**:
   - Store potatoes in pitch-black darkness in a breathable paper bag or cardboard box below **10°C (50°F)**.
"""
        return {
            "success": True,
            "reply": reply,
            "source": "knowledge_base",
            "model": "FreshKeeper-Engine",
            "food_detected": "Potato",
            "specs": None,
            "quick_hacks": ["Store in pitch darkness away from light", "Never store potatoes with onions", "Do not refrigerate raw potatoes"],
            "suggested_questions": ["Why shouldn't potatoes and onions be stored together?", "How to store onions?", "How long do potatoes last?"]
        }

    # F. Potatoes and onions together
    if "potato" in clean_msg and "onion" in clean_msg:
        reply = f"""{prefix_note}### 🥔🧅 Why Potatoes and Onions Must NEVER Be Stored Together

**Storing potatoes and onions in the same bin accelerates mutual destruction:**

1. **Ethylene & Moisture Conflict**:
   - Onions emit moisture and ethylene gas that trigger dormant potato eyes to sprout prematurely within days.
2. **Moisture Rot**:
   - Potatoes naturally release moisture as they respire, which causes dry onion skins to turn soft and succumb to neck rot (*Botrytis allii*).
3. **Optimal Separation**:
   - **Potatoes**: Store in a dark, cool (7°C - 10°C), well-ventilated paper bag.
   - **Onions**: Store in a dry, room-temperature (10°C - 15°C) hanging mesh basket with 360° airflow.
"""
        return {
            "success": True,
            "reply": reply,
            "source": "knowledge_base",
            "model": "FreshKeeper-Engine",
            "food_detected": "Potato & Onion",
            "specs": None,
            "quick_hacks": ["Separate bins by at least several feet", "Use breathable mesh or burlap for onions", "Keep potatoes in dark paper bags"],
            "suggested_questions": ["How to store potatoes for months?", "How to store cut onions?", "How to store garlic?"]
        }

    # G. Revive wilted greens
    if any(w in clean_msg for w in ["wilt", "limp", "revive", "soft lettuce", "soft spinach"]):
        reply = f"""{prefix_note}### 🥬 How to Revive Limp & Wilted Greens in 15 Minutes

**Limp greens are dehydrated, not spoiled! You can restore crunch with the Ice-Water Osmosis Trick:**

1. **Trim Stem Ends**: Cut 1/4 inch off bottom stems to open up water transport vascular tubes.
2. **Ice-Water Shock**: Submerge leaves completely in a large bowl filled with cold water and ice cubes for **15 to 30 minutes**.
3. **Osmosis Magic**: Plant cells pull water inward through cellular membranes, restoring crisp turgor pressure.
4. **Dry Thoroughly**: Spin dry in a salad spinner or gently roll in a clean kitchen towel before storing.
"""
        return {
            "success": True,
            "reply": reply,
            "source": "knowledge_base",
            "model": "FreshKeeper-Engine",
            "food_detected": "Leafy Greens",
            "specs": None,
            "quick_hacks": ["15-minute ice bath restores limp leaves", "Spin dry completely before refrigerating", "Line storage container with dry paper towels"],
            "suggested_questions": ["How to store spinach for 2+ weeks?", "How to store fresh herbs?", "How to store celery?"]
        }

    # H. Mold safety
    if "mold" in clean_msg or "mould" in clean_msg:
        reply = f"""{prefix_note}### 🍄 Mold Safety: What Can Be Cut vs What Must Be Discarded

**Mold consists of surface spores plus microscopic mycelial threads that penetrate deep inside porous food:**

- **DISCARD IMMEDIATELY**:
  - **Bread, Pastries, Tortillas**: Porous structure allows mold roots to penetrate through the entire loaf.
  - **Soft Cheeses (Brie, Ricotta, Mozzarella, Shredded Cheese)**: High moisture enables rapid bacterial & fungal toxins.
  - **Cooked Leftovers, Casseroles, Soft Fruits (Berries, Peaches)**: Liquid content spreads mycotoxins rapidly.
- **SAFE TO TRIM & SALVAGE**:
  - **Hard Cheeses (Cheddar, Parmesan, Pecorino)**: Cut away at least **1 inch (2.5 cm)** around and below the mold spot. Keep the knife clean.
  - **Dense Root Veggies (Carrots, Bell Peppers, Cabbage)**: Low moisture prevents root penetration. Cut away 1 inch around the mold.
"""
        return {
            "success": True,
            "reply": reply,
            "source": "knowledge_base",
            "model": "FreshKeeper-Engine",
            "food_detected": "Food Safety",
            "specs": None,
            "quick_hacks": ["Never sniff mold spores directly", "Cut 1 inch around mold on hard cheese only", "Discard porous bread immediately"],
            "suggested_questions": ["How to store bread to prevent mold?", "How to store berries without molding?", "How long do leftovers last?"]
        }

    # I. Ethylene gas overview
    if "ethylene" in clean_msg:
        ethylene_md = f"""{prefix_note}### ⚡ Ethylene Gas Dynamics & Produce Protection

**Ethylene (C₂H₄)** is a natural plant hormone released as a gas that triggers ripening, softening, and eventually decay.

#### 🚨 High Ethylene Emitters (Keep Isolated!)
- **Apples, Bananas, Avocados, Tomatoes, Melons (Cantaloupe), Pears, Peaches, Plums**

#### 🛡️ Ethylene-Sensitive Produce (Keep Protected!)
- **Leafy Greens (Lettuce, Spinach, Kale)**: Causes rapid yellowing and slime.
- **Carrots**: Triggers bitter isocoumarin production.
- **Cucumbers**: Causes pitting, yellowing, and rapid mushiness.
- **Potatoes**: Triggers premature sprouting.
- **Broccoli & Cauliflower**: Florets turn limp and yellow.

#### 💡 Golden Rule of Storage
Always store high ethylene producers on a **separate open counter or in a dedicated produce drawer** away from your leafy vegetables and root crops!
"""
        return {
            "success": True,
            "reply": ethylene_md,
            "source": "knowledge_base",
            "model": "FreshKeeper-Engine",
            "food_detected": "Ethylene Management",
            "specs": None,
            "quick_hacks": [
                "Never store apples next to carrots or greens",
                "Keep potatoes and onions in completely separate storage bins",
                "Wrap banana crowns in foil to trap ethylene at the stem"
            ],
            "suggested_questions": [
                "How to store bananas?",
                "How to store potatoes and onions?",
                "How to store leafy greens?"
            ]
        }

    # 3. Recognized Food from Knowledge Base
    target_key = food_key or detect_food_item(message)

    if target_key and target_key in OFFLINE_FOOD_KNOWLEDGE:
        data = OFFLINE_FOOD_KNOWLEDGE[target_key]
        reply_markdown = f"""{prefix_note}### 🌿 Storage Protocol for **{data['food']}**

#### 🌡️ 1. Optimal Storage Environment
- **Target Temperature**: {data['optimal_temp']}
- **Relative Humidity**: {data['humidity']}

#### ⚡ 2. Ethylene Dynamics & Isolation
- {data['ethylene']}

#### 💡 3. Pro Preservation Hacks (Shelf-Life Extension)
{chr(10).join(f"- {hack}" for hack in data['quick_hacks'])}

#### ⏱️ 4. Expected Longevity Gain
- **Standard Baseline**: {data['shelf_life_standard']}
- **With Recommended Protocol**: **{data['shelf_life_extended']}**

#### ⚠️ 5. Spoilage Warning Signs
- {data['spoilage_signs']}
"""
        return {
            "success": True,
            "reply": reply_markdown,
            "source": "knowledge_base",
            "model": "FreshKeeper-Engine",
            "food_detected": data["food"],
            "specs": {
                "optimal_temp": data["optimal_temp"],
                "humidity": data["humidity"],
                "shelf_life_standard": data["shelf_life_standard"],
                "shelf_life_extended": data["shelf_life_extended"],
                "ethylene": data["ethylene"]
            },
            "quick_hacks": data["quick_hacks"],
            "suggested_questions": [
                f"Can I freeze {data['food']}?",
                f"What items should I never store near {data['food']}?",
                f"How do I know if {data['food']} has gone bad?"
            ]
        }

    # 4. Unknown/Unrecognized Food: Provide General Preservation Science Protocol
    candidate_subject = extract_potential_food_subject(message) or "your food"
    unknown_reply = f"""{prefix_note}### 🥗 Food Preservation Science Advice

To maximize the shelf life and safety of **{candidate_subject}**, follow these fundamental kitchen cold-chain principles:

#### 🌡️ 1. Temperature Control
- **Perishables, Meats & Dairy**: Keep strictly between **1°C and 4°C (34°F - 39°F)** on interior refrigerator shelves.
- **Pantry & Dry Goods**: Store below **21°C (70°F)** in a dark, dry cabinet away from stove heat and sunlight.

#### 💧 2. Condensation & Moisture Management
- **Keep dry before storing**: Surface moisture is the #1 catalyst for fungal spore germination and bacterial rot.
- Use clean paper towels inside containers to wick away excess condensation.

#### 🛡️ 3. Air & Oxidation Barrier
- Oxygen triggers enzymatic browning and rancidity. Press air out of freezer bags or use airtight glass containers.

#### ⏱️ 4. The 2-Hour Safety Rule
- Never leave cooked perishable food at room temperature for more than 2 hours.
"""
    return {
        "success": True,
        "reply": unknown_reply,
        "source": "knowledge_base",
        "model": "FreshKeeper-Engine",
        "food_detected": candidate_subject if candidate_subject != "your food" else None,
        "specs": None,
        "quick_hacks": [
            "Use dry paper towels inside containers to absorb condensation",
            "Store in airtight glass containers to block oxygen and odors",
            "Freeze in single-meal portions if not consuming within 3-4 days"
        ],
        "suggested_questions": [
            "How to store bananas?",
            "How to store leafy greens and spinach?",
            "How to store cooked leftovers?"
        ]
    }


def query_gemini_storage_advisor(
    message: str,
    food_item: Optional[str] = None,
    history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Query the Gemini API for personalized food storage recommendations.
    Provides clear error reporting and falls back gracefully to offline food knowledge.
    """
    api_key = get_gemini_api_key()
    detected_food = detect_food_item(food_item or message)

    # If no Gemini key is configured or google-genai is missing, use offline food science engine
    if not api_key or not is_gemini_configured() or not GENAI_AVAILABLE or genai is None or types is None:
        return get_offline_response(message, detected_food)

    try:
        client = genai.Client(api_key=api_key)

        # Build contents supporting multi-turn conversational context
        contents: List[Any] = []
        if history:
            for turn in history[-6:]:
                role = "user" if turn.get("role") in ["user", "human"] else "model"
                txt = (turn.get("content") or turn.get("text") or "").strip()
                if txt:
                    contents.append(types.Content(role=role, parts=[types.Part.from_text(text=txt)]))

        # Add current user turn
        current_msg = message.strip()
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=current_msg)]))

        response_text = ""
        model_used = CANDIDATE_MODELS[0]
        last_model_error = ""

        for model_name in CANDIDATE_MODELS:
            try:
                config = types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.3,
                    max_output_tokens=1500,
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
                )
                resp = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config
                )
                text = extract_model_response_text(resp)
                if text:
                    response_text = text
                    model_used = model_name
                    break
            except Exception as model_err:
                last_model_error = str(model_err)
                continue

        if not response_text:
            # All Gemini model calls failed (e.g. invalid key, quota limit, temporary 503)
            clean_err = "Google Gemini model unreachable"
            if "API_KEY_INVALID" in last_model_error or "API key not valid" in last_model_error:
                clean_err = "API key is invalid. Please verify your key at Google AI Studio."
            elif "RESOURCE_EXHAUSTED" in last_model_error or "quota" in last_model_error.lower():
                clean_err = "Google Gemini quota reached (429 Resource Exhausted)."
            elif "503" in last_model_error or "UNAVAILABLE" in last_model_error:
                clean_err = "Google Gemini service temporarily busy (503). Providing verified food science answer:"

            fallback = get_offline_response(message, detected_food, gemini_error_notice=clean_err)
            fallback["gemini_error"] = last_model_error
            return fallback

        # Gemini succeeded!
        is_storage_guide = is_storage_guide_query(message)
        detected_name = (detected_food or "").replace("_", " ").title() if detected_food else None

        suggested_questions: List[str] = []
        if detected_name:
            suggested_questions = [
                f"Can I freeze {detected_name} after prepping?",
                f"How do I prevent {detected_name} from absorbing odors?",
                f"What items accelerate spoilage of {detected_name}?"
            ]
        else:
            suggested_questions = [
                "How to store bananas?",
                "How to store leafy greens?",
                "Can I freeze milk or cheese?"
            ]

        # Only attach specs & hacks when user is asking a storage guide for a recognized food
        specs = None
        quick_hacks: List[str] = []
        if is_storage_guide and detected_food and detected_food in OFFLINE_FOOD_KNOWLEDGE:
            specs = {
                "optimal_temp": OFFLINE_FOOD_KNOWLEDGE[detected_food]["optimal_temp"],
                "humidity": OFFLINE_FOOD_KNOWLEDGE[detected_food]["humidity"],
                "shelf_life_standard": OFFLINE_FOOD_KNOWLEDGE[detected_food]["shelf_life_standard"],
                "shelf_life_extended": OFFLINE_FOOD_KNOWLEDGE[detected_food]["shelf_life_extended"],
                "ethylene": OFFLINE_FOOD_KNOWLEDGE[detected_food]["ethylene"],
            }
            quick_hacks = OFFLINE_FOOD_KNOWLEDGE[detected_food].get("quick_hacks", [])

        return {
            "success": True,
            "reply": response_text,
            "source": "gemini",
            "model": model_used,
            "food_detected": detected_name,
            "specs": specs,
            "quick_hacks": quick_hacks,
            "suggested_questions": suggested_questions
        }

    except Exception as err:
        err_str = str(err)
        clean_err = "Google Gemini authentication error"
        if "API_KEY_INVALID" in err_str or "API key not valid" in err_str:
            clean_err = "API key is invalid. Please verify your key in Google AI Studio."
        elif "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
            clean_err = "Google Gemini quota exhausted."
        elif "503" in err_str or "UNAVAILABLE" in err_str:
            clean_err = "Google Gemini model temporarily busy. Answering via food science knowledge base:"

        fallback = get_offline_response(message, detected_food, gemini_error_notice=clean_err)
        fallback["gemini_error"] = err_str
        return fallback


# Convenient alias
query_storage_advisor = query_gemini_storage_advisor
