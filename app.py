import streamlit as st
import pickle
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import process, fuzz

# CẤU HÌNH TRANG
st.set_page_config(page_title="Steam Game Recommender", layout="wide")

@st.cache_resource
def load_models():
    try:
        games = pickle.load(open('games_list.pkl', 'rb'))
        tfidf_matrix = pickle.load(open('tfidf_matrix.pkl', 'rb'))
        games['Name'] = games['Name'].astype(str)
        return games, tfidf_matrix
    except Exception as e:
        st.error(f"Lỗi tải dữ liệu: {e}")
        return None, None

games, tfidf_matrix = load_models()

# Hàm lấy gợi ý game tương đồng
def get_recommendations(title):
    try:
        idx = games[games['Name'] == title].index[0]
        query_vector = tfidf_matrix[idx]
        sim_scores = cosine_similarity(query_vector, tfidf_matrix).flatten()
        related_indices = sim_scores.argsort()[-6:-1][::-1]
        return games.iloc[related_indices]
    except:
        return None

# Hàm tìm kiếm nhanh kết hợp thông minh
@st.cache_data(ttl=600)
def fast_smart_search(query, _all_names):
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
        limit=10
    )
    fuzzy_matches = [res[0] for res in fuzzy_results if res[1] > 70]
    
    # Gộp và loại trùng
    return list(dict.fromkeys(starts_with + contains_all + fuzzy_matches))[:10]

# GIAO DIỆN CHÍNH
st.title("🎮 Steam Game Discovery Hub")

if games is not None:
    # THANH SEARCH
    search_query = st.text_input(
        "🔍 Tìm kiếm game:", 
        placeholder="Nhập tên game để khám phá...",
        key="main_search"
    )

    if search_query:
        # Gọi hàm search đã tối ưu tốc độ
        suggestions = fast_smart_search(search_query, games['Name'].unique())

        if suggestions:
            with st.container(border=True):
                st.caption("Kết quả tìm kiếm phù hợp nhất:")
                for name in suggestions:
                    if st.button(name, key=f"sug_{name}", use_container_width=True):
                        st.session_state.selected_game = name
                        st.rerun()
        else:
            st.info("Không tìm thấy game nào phù hợp.")

    # HIỂN THỊ KẾT QUẢ ĐỀ XUẤT
    if 'selected_game' in st.session_state and st.session_state.selected_game:
        st.divider()
        st.subheader(f"🎯 Đề xuất dựa trên: {st.session_state.selected_game}")
        
        recommendations = get_recommendations(st.session_state.selected_game)
        
        if recommendations is not None:
            cols = st.columns(5)
            for i, (index, row) in enumerate(recommendations.iterrows()):
                with cols[i]:
                    st.image(row['Header image'], use_container_width=True)
                    st.write(f"**{row['Name']}**")
else:
    st.error("Không thể tải dữ liệu. Vui lòng kiểm tra lại file dữ liệu.")