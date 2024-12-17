import React, { useState, useEffect, memo } from "react";
import "./CommentSection.css";
import { VscSend } from "react-icons/vsc";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { FaRegComment } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import moment from "moment";

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  replies: Comment[];
  likes?: number;
  likedByYou: boolean;
  avatar: string;
}

// Function to generate a random avatar
const getRandomAvatar = (name: string) => {
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#F4F400"];
  const index = name.length % colors.length;
  return colors[index];
};

// Memoized CommentItem Component for rendering each comment
const CommentItem: React.FC<{
  comment: Comment;
  handleDelete: (id: string) => void;
  handleLike: (id: string) => void;
  handleReply: (parentId: string, replyText: string) => void;
}> = memo(({ comment, handleDelete, handleLike, handleReply }) => {
  const [replyInput, setReplyInput] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReplyButtonClick = () => {
    setShowReplyInput((prev) => !prev);
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (replyInput.trim()) {
        handleReply(comment.id, replyInput);
        setReplyInput("");
        setShowReplyInput(false);
      }
    }
  };

  const handleLikeClick = () => {
    handleLike(comment.id); // Handle like toggle
  };

  return (
    <div className="comment-container">
      <div className="comment-content">
        <div className="comment-header">
          <div
            className="comment-avatar"
            style={{ backgroundColor: getRandomAvatar(comment.author) }}
          >
            {comment.author[0].toUpperCase()}
          </div>
          <p>
            <strong className="comment-name">{comment.author}</strong>
            <span className="timeStamp">
              · {moment(comment.timestamp).fromNow()} ·
            </span>
          </p>
        </div>
        <p className="comment-text">{comment.text}</p>
        <div className="comment-actions">
          <button onClick={handleLikeClick} className="like-button">
            {comment.likedByYou ? (
              <BiSolidLike size={16} color="#fff" />
            ) : (
              <BiLike size={16} />
            )}
            {"  "}
            {comment.likes > 0 && <span>{comment.likes}</span>}{" "}
            {/* Show likes count */}
          </button>
          <button onClick={handleReplyButtonClick} className="reply-button">
            <FaRegComment size={12} />
            {"  "} Reply
          </button>
          <button
            onClick={() => handleDelete(comment.id)}
            className="delete-button"
          >
            <RiDeleteBin5Line size={12} />
            {"  "}
            Delete
          </button>
        </div>
      </div>

      {showReplyInput && (
        <div className="reply-input-container">
          <input
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            onKeyDown={handleReplyKeyDown}
            placeholder="Write a reply..."
            className="reply-input"
          />
          <button
            onClick={() => {
              if (replyInput.trim()) {
                handleReply(comment.id, replyInput);
                setReplyInput("");
                setShowReplyInput(false);
              }
            }}
            className="submit-reply-button"
          >
            <VscSend color="#fff" size={20} />
          </button>
        </div>
      )}

      {comment.replies &&
        comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            handleDelete={handleDelete}
            handleLike={handleLike}
            handleReply={handleReply}
          />
        ))}
    </div>
  );
});

const CommentSection: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  useEffect(() => {
    const initialComments: Comment[] = [
      {
        id: "1",
        text: "This is the first comment!",
        author: "Alice",
        timestamp: moment().subtract(1, "days").toDate(),
        likes: 10,
        replies: [],
        likedByYou: true,
        avatar: getRandomAvatar("Alice"),
      },
      {
        id: "2",
        text: "Great work, looking forward to more updates.",
        author: "Bob",
        timestamp: moment().subtract(12, "hours").toDate(),
        likes: 11,
        likedByYou: false,
        replies: [
          {
            id: "6",
            text: "Great work, looking forward to more updates.",
            author: "Bob",
            timestamp: moment().subtract(10, "hours").toDate(),
            likes: 40,
            replies: [],
            likedByYou: true,
            avatar: getRandomAvatar("Bob"),
          },
        ],
        avatar: getRandomAvatar("Bob"),
      },
      {
        id: "3",
        text: "Great work, looking forward to more updates.",
        author: "John",
        timestamp: moment().subtract(8, "hours").toDate(),
        likes: 3,
        replies: [],
        likedByYou: false,
        avatar: getRandomAvatar("Bob"),
      },
    ];
    const savedComments = localStorage.getItem("comments");
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      localStorage.setItem("comments", JSON.stringify(initialComments));
      setComments(initialComments);
    }
  }, []);

  useEffect(() => {
    if (comments.length > 0) {
      localStorage.setItem("comments", JSON.stringify(comments));
    }
  }, [comments]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        text: newComment,
        author: "User",
        timestamp: new Date(),
        replies: [],
        likes: 0,
        likedByYou: false,
        avatar: getRandomAvatar("User"),
      };
      setComments((prev: any) => [...prev, newCommentObj]);
      setNewComment("");
    }
  };

  const handleAddReply = (parentId: string, replyText: string) => {
    const newReply: Comment = {
      id: Date.now().toString(),
      text: replyText,
      author: "User",
      timestamp: new Date(),
      replies: [],
      likes: 0,
      likedByYou: false,
      avatar: getRandomAvatar("User"),
    };

    const updateReplies = (comments: Comment[]): Comment[] =>
      comments.map((comment) => {
        if (comment.id === parentId) {
          return { ...comment, replies: [...comment.replies, newReply] };
        }
        return { ...comment, replies: updateReplies(comment.replies) };
      });

    setComments((prev: Comment[]) => updateReplies(prev));
  };

  const handleDeleteComment = (id: string) => {
    const deleteComment = (comments: Comment[]): Comment[] =>
      comments.filter((comment) => {
        if (comment.id === id) return false;
        comment.replies = deleteComment(comment.replies);
        return true;
      });

    setComments((prev: Comment[]) => deleteComment(prev));
  };

  const handleLikeComment = (id: string) => {
    const updateLikes = (comments: Comment[]): Comment[] =>
      comments.map((comment) => {
        if (comment.id === id) {
          const newLikedByYou = !comment.likedByYou;
          const likes = comment.likes || 0;
          const newLikes = newLikedByYou ? likes + 1 : likes - 1;

          return { ...comment, likedByYou: newLikedByYou, likes: newLikes };
        }
        return { ...comment, replies: updateLikes(comment.replies) };
      });

    setComments((prev) => updateLikes(prev));
  };

  return (
    <div className="comment-section-container">
      <h1 className="comment-section-title">Comment Section</h1>
      <div className="new-comment-container">
        <input
          value={newComment}
          onChange={(e: { target: { value: any } }) =>
            setNewComment(e.target.value)
          }
          placeholder="Write a comment..."
          className="new-comment-input"
          onKeyDown={(e: {
            key: string;
            shiftKey: any;
            preventDefault: () => void;
          }) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <button onClick={handleAddComment} className="add-comment-button">
          <VscSend color="#fff" size={20} />
        </button>
      </div>
      <div className="comments-list">
        {comments.map((comment: { id: any }) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            handleDelete={handleDeleteComment}
            handleLike={handleLikeComment}
            handleReply={handleAddReply}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
