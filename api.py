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
tfidf_matrix = pickle.load(open('tfidf_matrix.pkl', 'rb'))
print(games.columns.tolist())
print(games['Positive'].dtype)
print(games['Positive'].head())

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