import React, { useState, useEffect, memo } from "react";
import "./CommentSection.css";
import { VscSend } from "react-icons/vsc";
import { BiLike } from "react-icons/bi";
import { FaRegComment } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import moment from "moment";

// TypeScript interface for Comment
interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  replies: Comment[];
  likes?: number;
}

// Memoized CommentItem Component for rendering each comment
const CommentItem: React.FC<{
  comment: Comment;
  handleDelete: (id: string) => void;
  handleLike: (id: string) => void;
  handleReply: (parentId: string, replyText: string) => void;
}> = memo(({ comment, handleDelete, handleLike, handleReply }) => {
  const [replyInput, setReplyInput] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false); // New state to toggle reply input visibility

  const handleReplyButtonClick = () => {
    setShowReplyInput((prev) => !prev); // Toggle reply input visibility
  };

  return (
    <div className="comment-container">
      <div className="comment-content">
        <p>
          <strong className="comment-name">{comment.author}</strong>
          <span className="timeStamp">
            · {moment(comment.timestamp).fromNow()}
          </span>
        </p>
        <p className="comment-text">{comment.text}</p>
        <div className="comment-actions">
          <button
            onClick={() => handleLike(comment.id)}
            className="like-button"
          >
            <BiLike size={12} />
            {"  "}
            {comment.likes || 0}
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

      {/* Conditionally render reply input based on showReplyInput */}
      {showReplyInput && (
        <div className="reply-input-container">
          <input
            type="text"
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            placeholder="Write a reply..."
            className="reply-input"
          />
          <button
            onClick={() => {
              if (replyInput.trim()) {
                handleReply(comment.id, replyInput);
                setReplyInput(""); // Reset reply input after submitting
                setShowReplyInput(false); // Hide reply input after submitting
              }
            }}
            className="submit-reply-button"
          >
            <VscSend color="#fff" size={20} />
          </button>
        </div>
      )}

      {/* Render Replies */}
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

  // Load comments from localStorage or use initial comments
  useEffect(() => {
    // Preloaded initial comments
    const initialComments: Comment[] = [
      {
        id: "1",
        text: "This is the first comment!",
        author: "Alice",
        timestamp: moment().subtract(1, "days").toDate(), // Yesterday
        likes: 2,
        replies: [
          {
            id: "4",
            text: "This is the reply to first comment.",
            author: "Bob",
            timestamp: moment().subtract(10, "hours").toDate(), // 2 hours ago
            replies: [],
            likes: 5,
          },
        ],
      },
      {
        id: "2",
        text: "Great work, looking forward to more updates.",
        author: "Bob",
        timestamp: moment().subtract(12, "hours").toDate(), // 2 hours ago
        replies: [],
        likes: 5,
      },
      {
        id: "3",
        text: "Amazing, keep it up!",
        author: "Charlie",
        timestamp: moment().subtract(2, "hours").toDate(), // 2 hours ago
        replies: [],
        likes: 1,
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

  // Save comments to localStorage whenever they change
  useEffect(() => {
    if (comments.length > 0) {
      localStorage.setItem("comments", JSON.stringify(comments));
    }
  }, [comments]);

  // Add a new comment
  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        text: newComment,
        author: "User",
        timestamp: new Date(),
        replies: [],
        likes: 0,
      };
      setComments((prev) => [...prev, newCommentObj]);
      setNewComment("");
    }
  };

  // Add a reply to a comment
  const handleAddReply = (parentId: string, replyText: string) => {
    const newReply: Comment = {
      id: Date.now().toString(),
      text: replyText,
      author: "User",
      timestamp: new Date(),
      replies: [],
      likes: 0,
    };

    const updateReplies = (comments: Comment[]): Comment[] =>
      comments.map((comment) => {
        if (comment.id === parentId) {
          return { ...comment, replies: [...comment.replies, newReply] };
        }
        return { ...comment, replies: updateReplies(comment.replies) };
      });

    setComments((prev) => updateReplies(prev));
  };

  // Delete a comment or reply
  const handleDeleteComment = (id: string) => {
    const deleteComment = (comments: Comment[]): Comment[] =>
      comments.filter((comment) => {
        if (comment.id === id) return false;
        comment.replies = deleteComment(comment.replies);
        return true;
      });

    setComments((prev) => deleteComment(prev));
  };

  // Like a comment or reply
  const handleLikeComment = (id: string) => {
    const updateLikes = (comments: Comment[]): Comment[] =>
      comments.map((comment) => {
        if (comment.id === id) {
          return { ...comment, likes: (comment.likes || 0) + 1 };
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
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="new-comment-input"
        />
        <button onClick={handleAddComment} className="add-comment-button">
          <VscSend color="#fff" size={20} />
        </button>
      </div>
      <div className="comments-list">
        {comments.map((comment) => (
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
