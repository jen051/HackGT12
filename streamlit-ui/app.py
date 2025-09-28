# streamlit-ui/app.py
import io
import json
import requests
import pandas as pd
import streamlit as st

# -------------------- Config --------------------
SERVER_URL = "http://localhost:4000/generate-list"  # FastAPI endpoint
DEFAULT_QUERY = (
    "Please generate my grocery list based on my saved preferences and inventory."
)

st.set_page_config(page_title="MCP Frontend", page_icon="🛒", layout="centered")
st.title("Grocery List + Recipe Generator 🛒")
st.caption("Enter a username + query → call FastAPI → show LLM response")

# -------------------- Session Init --------------------
if "llm_response" not in st.session_state:
    st.session_state.llm_response = None
if "purchased" not in st.session_state:
    st.session_state.purchased = {}

# -------------------- UI: Inputs --------------------
try:
    qp = st.query_params  # New API
except AttributeError:
    qp = st.experimental_get_query_params()  # Fallback

# pref_username = qp.get("username", "") if isinstance(qp, dict) else qp.get("username", [""])[0]
# pref_query = qp.get("query", "") if isinstance(qp, dict) else qp.get("query", [""])[0]
# autorun = (qp.get("autorun", "0") if isinstance(qp, dict) else qp.get("autorun", ["0"])[0]) == "1"

# -------------------- UI: Inputs --------------------
username = st.text_input("Username", placeholder="e.g., jennifer_jiang")


user_query = st.text_area(
    "User Query",
    value=DEFAULT_QUERY,
    placeholder="What do you want the LLM to do?",
    height=120,
)

left, right, _ = st.columns([1, 1, 6])
with left:
    run_clicked = st.button("Run MCP")

# -------------------- Action --------------------
if run_clicked:
    if not username.strip():
        st.warning("Please enter a username.")
    else:
        with st.spinner("Contacting MCP server…"):
            try:
                payload = {
                    "user_id": username.strip(),
                    "user_query": (user_query.strip() or DEFAULT_QUERY),
                    # If your Pydantic model requires it, keep this line:
                    # "context": {}
                }
                r = requests.post(SERVER_URL, json=payload, timeout=60)
                r.raise_for_status()

                data = r.json()
                st.session_state.llm_response = data
                st.session_state.purchased = {}  # reset checkboxes
                st.success("Done!")
            except requests.exceptions.ConnectionError:
                st.error(
                    f"Could not connect to the MCP server at {SERVER_URL}.\n\n"
                    "Is FastAPI running on port 4000?\n"
                    "Start it with:  `uvicorn main:app --reload --port 4000`"
                )
            except requests.exceptions.HTTPError as e:
                st.error(f"Server returned an error: {e}\n\nBody: {r.text}")
            except Exception as e:
                st.error(f"Unexpected error: {e}")

st.divider()

# -------------------- Renderer --------------------
def render_response(data: dict):
    # 1) Header metrics
    c1, c2 = st.columns(2)
    with c1:
        st.metric("Estimated Total Cost", f"${float(data.get('estimatedTotalCost', 0)):0.2f}")
    with c2:
        st.metric("Total Recipes", len(data.get("recipeList", [])))

    st.divider()

    # 2) Recipes as cards
    st.subheader("🍽️ Recipes")
    recipes = data.get("recipeList", []) or []
    if not recipes:
        st.info("No recipes in the response.")
    else:
        for r in recipes:
            with st.container(border=True):
                top = st.columns([3, 1, 1])
                with top[0]:
                    st.markdown(f"### {r.get('recipe', '(unnamed)')}")
                with top[1]:
                    if "cookingTime" in r:
                        st.metric("Time", f"{r['cookingTime']} min")
                with top[2]:
                    if "totalCost" in r:
                        st.metric("Cost", f"${float(r['totalCost']):.2f}")
                st.caption("Ingredients")
                ings = r.get("ingredients", []) or []
                ncols = 3 if len(ings) >= 9 else (2 if len(ings) >= 5 else 1)
                cols = st.columns(ncols)
                for i, ing in enumerate(ings):
                    cols[i % ncols].write(f"• {ing}")

    st.divider()

    # 3) Grocery list
    st.subheader("🛒 Grocery List")
    items = data.get("groceryList", []) or []
    if not items:
        st.info("No grocery items in the response.")
        return

    q = st.text_input("Filter items", placeholder="e.g., chicken, dairy, pasta").lower().strip()
    if q:
        items = [x for x in items if q in x.get("item", "").lower() or q in x.get("category", "").lower()]

    df = pd.DataFrame(items)
    if df.empty:
        st.info("No grocery items match the filter.")
        return

    for cat, group in df.groupby("category", sort=True):
        with st.expander(f"{cat}  ({len(group)})", expanded=True):
            for i, row in group.reset_index(drop=True).iterrows():
                key = f"chk-{row['item']}-{i}-{cat}"
                default = st.session_state.purchased.get(key, False)
                st.session_state.purchased[key] = st.checkbox(
                    f"{row['item']}  x{row.get('quantity', 1)}",
                    value=default,
                    key=key,
                )

    st.caption("Full list (sortable)")
    st.dataframe(
        df.sort_values(["category", "item"]).reset_index(drop=True),
        use_container_width=True,
        hide_index=True,
    )

    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    st.download_button("Download Grocery CSV", csv_buf.getvalue(), file_name="grocery_list.csv", mime="text/csv")
    st.download_button("Download Full JSON", json.dumps(data, indent=2), file_name="response.json", mime="application/json")

    st.divider()
    with st.expander("Raw JSON"):
        st.code(json.dumps(data, indent=2), language="json")

# -------------------- Output --------------------
resp = st.session_state.llm_response
if isinstance(resp, str):
    try:
        resp = json.loads(resp)
    except json.JSONDecodeError:
        st.error("Response was not valid JSON.")
        st.code(resp)

if isinstance(resp, dict):
    render_response(resp)
else:
    st.info("No response yet. Enter a username and click **Run MCP**.")
