from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import fuzz, process
from functools import lru_cache  

app = FastAPI(title="Steam Game Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# RUN : uvicorn api:app --reload --port 8000
games = pickle.load(open('games_list.pkl', 'rb'))
games = games.loc[:, ~games.columns.duplicated()]
tfidf_matrix = pickle.load(open('tfidf_matrix.pkl', 'rb'))


print(games.columns.tolist())


def get_recommendations(title: str):
    matches = games[games['Name'] == title]
    if matches.empty:
        raise HTTPException(status_code=404, detail=f"Game '{title}' không tìm thấy")
    
    idx = matches.index[0]
    query_vector = tfidf_matrix[idx]
    sim_scores = cosine_similarity(query_vector, tfidf_matrix).flatten()
    related_indices = sim_scores.argsort()[-6:-1][::-1]
    result = games.iloc[related_indices]

    return [
        {
            "name": row["Name"],
            "image": row["Header image"],
            "score": float(sim_scores[idx_r])
        }
        for idx_r, (_, row) in zip(related_indices, result.iterrows())
    ]


@lru_cache(maxsize=128)
def fast_smart_search(query):
    query_clean = query.lower().strip()
    words = query_clean.split()
    
    # Lọc thô bằng Pandas (Cực nhanh) để lấy các game chứa từ đầu tiên
    mask = games['Name'].str.contains(words[0], case=False, na=False)
    filtered_names = games[mask]['Name'].unique()
    
    # Ưu tiên bắt đầu bằng cụm từ
    starts_with = [name for name in filtered_names if name.lower().startswith(query_clean)]
    
    # Chứa đầy đủ các từ khóa
    contains_all = [
        name for name in filtered_names 
        if all(word in name.lower() for word in words)
    ]
    
    # Fuzzy Matching trên tập đã lọc (Giúp tăng tốc độ xử lý)
    fuzzy_results = process.extract(
        query_clean, 
        filtered_names, 
        scorer=fuzz.token_set_ratio, 
        limit=5000
    )
    fuzzy_matches = [res[0] for res in fuzzy_results if res[1] > 70]
    
    # Gộp và loại trùng
    return list(dict.fromkeys(starts_with + contains_all + fuzzy_matches))



# End point
    
@app.get("/games")  
def list_games():
    return {"games": games["Name"].tolist()}


@app.get("/recommend")
def recommend(title: str):
    recs = get_recommendations(title)
    return {"query": title, "recommendations": recs}

@app.get("/trending")
def trending(limit: int = 5):
    try:
        df = games.copy()
        df['Positive'] = pd.to_numeric(df['Positive'], errors='coerce').fillna(0)
        top = df.nlargest(limit, 'Positive')
        return {
            "games": [
                {
                    "name": row["Name"],
                    "image": row["Header image"],
                    "positive": int(row["Positive"])
                }
                for _, row in top.iterrows()
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@app.get("/search")
def search(
    q: str = "",
    genre: str = "",
    tag: str = "",
    os: str = "",
    free: bool = False,
    limit: int = 5000,
    smart: bool = True
):
    try:
        df = games.copy()
        
        if q and smart:
            # Lấy danh sách tên game gợi ý
            suggested_names = fast_smart_search(q)
            if suggested_names:
                # Lọc theo danh sách gợi ý
                df = df[df['Name'].isin(suggested_names)]
            else:
                # Fallback về tìm kiếm thông thường
                df = df[df['Name'].str.contains(q, case=False, na=False)]
        elif q:
            df = df[df['Name'].str.contains(q, case=False, na=False)]
        
        if genre:
            df = df[df['Genres'].str.contains(genre, case=False, na=False)]
        
        if tag:
            df = df[df['Tags'].str.contains(tag, case=False, na=False)]
        
        if os == 'windows':
            df = df[df['Windows'] == True]
        elif os == 'mac':
            df = df[df['Mac'] == True]
        elif os == 'linux':
            df = df[df['Linux'] == True]
        
        if free:
            df = df[df['Price'] == 0]
        
        df = df.sort_values('Positive', ascending=False)
        
        return {
            "total": len(df),
            "results": [
                {
                    "name": row["Name"],
                    "image": row["Header image"],
                    "genres": row["Genres"],
                    "tags": row["Tags"], 
                    "price": float(row["Price"]),
                    "positive": int(row["Positive"]),
                    "avg_playtime": int(row["Average playtime forever"])
                }
                for _, row in df.head(limit).iterrows()
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/search/suggest")
def search_suggestions(q: str = ""):
    if not q:
        return {"suggestions": []}
    try:
        df = games.copy()
        df['Positive'] = pd.to_numeric(df['Positive'], errors='coerce').fillna(0)
        
        # Filter theo tên chứa query
        df = df[df['Name'].str.contains(q, case=False, na=False)]
        
        # Sort theo popular và lấy top 5
        top5 = df.nlargest(5, 'Positive')
        
        return {
            "suggestions": [
                {
                    "name": row["Name"],
                    "image": row["Header image"],
                    "positive": int(row["Positive"])
                }
                for _, row in top5.iterrows()
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/featured")
def featured(category: str = "popular", limit: int = 10):
    df = games.copy()
    df['Positive'] = pd.to_numeric(df['Positive'], errors='coerce').fillna(0)
    df['Price'] = pd.to_numeric(df['Price'], errors='coerce').fillna(0)

    if category == "popular":
        df = df.nlargest(limit, 'Positive')
    elif category == "free":
        df = df[df['Price'] == 0].nlargest(limit, 'Positive')
    elif category == "multiplayer":
        df = df[df['Tags'].str.contains('Multiplayer', case=False, na=False)].nlargest(limit, 'Positive')

    return {
        "games": [
            {"name": row["Name"], "image": row["Header image"], "positive": int(row["Positive"]), "price": float(row["Price"])
             , "genres": row["Genres"]}
            for _, row in df.iterrows()
        ]
    }