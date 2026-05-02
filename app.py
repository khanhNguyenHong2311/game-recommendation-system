import streamlit as st
import pickle
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


st.set_page_config(page_title="Steam Game Recommender", layout="wide")


@st.cache_resource
def load_models():
    games = pickle.load(open('games_list.pkl', 'rb'))
    tfidf_matrix = pickle.load(open('tfidf_matrix.pkl', 'rb'))
    return games, tfidf_matrix

games, tfidf_matrix = load_models()


def get_recommendations(title):
    idx = games[games['Name'] == title].index[0]
    query_vector = tfidf_matrix[idx]
    sim_scores = cosine_similarity(query_vector, tfidf_matrix).flatten()
    related_indices = sim_scores.argsort()[-6:-1][::-1]
    return games.iloc[related_indices]


st.title("🎮 Steam Game Discovery Hub")
st.write("Chọn một game bạn thích, hệ thống sẽ tìm cho bạn những siêu phẩm tương đồng!")


selected_game_name = st.selectbox(
    "Nhập hoặc chọn tên game:",
    games['Name'].values
)

if st.button('Tìm game tương tự'):
    recommendations = get_recommendations(selected_game_name)
    st.subheader(f"Gợi ý dựa trên: {selected_game_name}")
    cols = st.columns(5)
    for i, (index, row) in enumerate(recommendations.iterrows()):
        with cols[i]:
            st.image(row['Header image'], use_container_width=True)
            st.write(f"**{row['Name']}**")

