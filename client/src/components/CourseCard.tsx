import React from "react";
import { Course } from "./CategoryColumn";

const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
  <div className="card">
    <a href={course.url} target="_blank" rel="noopener noreferrer">
      {course.name}
    </a>
    <p>{course.time}</p>
  </div>
);

export default CourseCard;
