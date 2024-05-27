import SearchBar from "../components/main/SearchBar";
import styled, { keyframes } from "styled-components";
import {
  BANNER_TITLE,
  NO_RESULT_MESSAGE,
  NO_RESULT_MESSAGE_DESCRIPTION,
} from "../constants/search";
import NoResult from "../components/main/NoResult";
import useSearchResult from "../hooks/useSearchResult";
import ResultList from "../components/main/ResultList";
import { ResultListType } from "../types/searchResult";
import Bookmark from "../common/Image/Bookmark";
import BookmarkBorder from "../common/Image/BookmarkBorder";
import { VirtuosoGrid, VirtuosoHandle } from "react-virtuoso";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import React from "react";

const Main = () => {
  const {
    value,
    setValue,
    onChange,
    searchResults,
    refetch,
    toggleFavorites,
    hasNextPage,
    isFetching,
    fetchNextPage,
  } = useSearchResult();

  const loadMore = useCallback(() => {
    if (!isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // 스크롤 위치 저장 및 복원 로직
  const saveScrollPosition = () => {
    if (virtuosoRef.current) {
      const scrollTop = window.scrollY;
      sessionStorage.setItem("scrollPosition", String(scrollTop));
    }
  };

  const restoreScrollPosition = () => {
    const savedScrollPosition =
      Number(sessionStorage.getItem("scrollPosition")) || 0;
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: savedScrollPosition,
        align: "start",
      });
    }
    console.log(savedScrollPosition);
  };

  useEffect(() => {
    restoreScrollPosition();
    window.addEventListener("scroll", saveScrollPosition);
    return () => {
      window.removeEventListener("scroll", saveScrollPosition);
    };
  }, []);

  return (
    <Page>
      <SearchBanner>
        <BannerTitle>{BANNER_TITLE}</BannerTitle>
        <SearchBar
          refetch={refetch}
          value={value}
          setValue={setValue}
          onChange={onChange}
        />
      </SearchBanner>
      {(!searchResults || searchResults?.pages[0]?.results.length === 0) && (
        <NoResult
          title={NO_RESULT_MESSAGE}
          description={NO_RESULT_MESSAGE_DESCRIPTION}
        />
      )}
      {searchResults && (
        <VirtuosoGrid
          ref={virtuosoRef}
          style={{
            height: `calc(100vh - 50px)`,
            margin: 0,
          }}
          useWindowScroll
          data={searchResults?.pages.flatMap((page) => page.results) || []}
          endReached={loadMore}
          overscan={200}
          itemContent={(index, result: ResultListType) =>
            result && (
              <ResultItem key={result.id} index={index}>
                <ResultList
                  searchResult={result}
                  renderBookmark={({ onClick, isFavorites }) =>
                    isFavorites ? (
                      <Bookmark
                        onClick={(e: React.MouseEvent<HTMLOrSVGElement>) => {
                          e.stopPropagation();
                          onClick(e);
                          toggleFavorites(result);
                        }}
                        width="16"
                        height="16"
                        cursor="pointer"
                      />
                    ) : (
                      <BookmarkBorder
                        onClick={(e: React.MouseEvent<HTMLOrSVGElement>) => {
                          e.stopPropagation();
                          onClick(e);
                          toggleFavorites(result);
                        }}
                        width="16"
                        height="16"
                        fill="#007BE9"
                        cursor="pointer"
                      />
                    )
                  }
                />
              </ResultItem>
            )
          }
          components={{
            List: forwardRef(({ style, children, ...props }, ref) => (
              <div
                ref={ref}
                {...props}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  margin: "0 auto",
                  paddingBottom: "20px",
                  maxWidth: "1200px",
                  gap: "1rem",
                  ...style,
                }}
              >
                {children}
              </div>
            )),
            Item: ({ children, ...props }) => (
              <div
                {...props}
                style={{
                  padding: "0.5rem",
                  width: "calc(50% - 1rem)", // 한 줄에 2개의 아이템이 나오도록 설정
                  maxWidth: "90%",
                  display: "flex",
                  justifyContent: "center",
                  flex: "none",
                  alignContent: "stretch",
                  boxSizing: "border-box",
                }}
              >
                {children}
              </div>
            ),
          }}
        />
      )}
    </Page>
  );
};

export default Main;

const Page = styled.div``;

const SearchBanner = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 46rem;
  background-color: rgba(202, 233, 255, 1);
`;

const BannerTitle = styled.h3`
  font-size: 3.4rem;
  font-weight: bold;
  line-height: 5.2rem;
  text-align: center;
  white-space: pre-line;
  margin-bottom: 40px;
`;

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const ResultsContainer = styled.div`
  width: 100%;
  padding: 20px 10px;
`;

export const ResultItem = styled.div<{ index: number }>`
  max-width: 90%;
  margin-top: 20px;
`;
