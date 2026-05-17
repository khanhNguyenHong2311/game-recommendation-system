from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

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
    limit: int = 20
):
    try:
        df = games.copy()
        
        if q:
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
            "genres": row.get("Genres", ""),
            "price": float(row["Price"]),
            "positive": int(row["Positive"]),

            "tags": row.get("Tags", ""),
            "about": row.get("About the game", ""),
            "developer": row.get("Developers", ""),
            "publisher": row.get("Publishers", ""),
            "languages": row.get("Supported languages", ""),
            "release_date": row.get("Release date", ""),

            "windows": bool(row.get("Windows", False)),
            "mac": bool(row.get("Mac", False)),
            "linux": bool(row.get("Linux", False))
        }
        for _, row in df.head(limit).iterrows()
    ]
}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@app.get("/game")
def game_detail(name: str):
    try:
        game = games[games['Name'] == name]

        if game.empty:
            raise HTTPException(status_code=404, detail="Game not found")

        row = game.iloc[0]

        return  {
        "name": row["Name"],
        "image": row["Header image"],
        "genres": row.get("Genres", ""),
        "price": float(row["Price"]),
        "positive": int(row["Positive"]),

        "tags": row.get("Tags", ""),
        "description": row.get("About the game", ""),
        "developer": row.get("Developers", ""),
        "publisher": row.get("Publishers", ""),
        "languages": row.get("Supported languages", ""),
        "release_date": row.get("Release date", ""),

        "windows": bool(row.get("Windows", False)),
        "mac": bool(row.get("Mac", False)),
        "linux": bool(row.get("Linux", False))
    }


    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))