/**
 * Summary:
 * This file defines the `Course` component for displaying course details, video playback,
 * instructor information, and chapter content using tabs (Notes, Resources, and Quiz).
 *
 * Key Features:
 * - Video player with progress tracking to auto-mark chapters as completed at 80% playback.
 * - Tabs for viewing Notes, Resources, and Quiz content.
 * - Instructor information and bio displayed alongside the course.
 * - Loading and error handling for data states.
 */

"use client";

import { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReactPlayer from "react-player";
import Loading from "@/components/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";

/**
 * Main Course component:
 * - Fetches course and progress data.
 * - Displays video player, content tabs, and instructor details.
 */
const Course = () => {
  const {
    user,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  } = useCourseProgressData();

  // Reference to the video player for handling progress tracking
  const playerRef = useRef<ReactPlayer>(null);

  /**
   * Handles video progress to mark a chapter as completed when 80% is played.
   */
  const handleProgress = ({ played }: { played: number }) => {
    if (
      played >= 0.8 && // 80% progress threshold
      !hasMarkedComplete &&
      currentChapter &&
      currentSection &&
      userProgress?.sections &&
      !isChapterCompleted()
    ) {
      setHasMarkedComplete(true);
      updateChapterProgress(
        currentSection.sectionId,
        currentChapter.chapterId,
        true
      );
    }
  };

  // Loading and error handling states
  if (isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view this course.</div>;
  if (!course || !userProgress) return <div>Error loading course</div>;

  return (
    <div className="course">
      <div className="course__container">
        {/* Breadcrumb and Course Title */}
        <div className="course__breadcrumb">
          <div className="course__path">
            {course.title} / {currentSection?.sectionTitle} /{" "}
            <span className="course__current-chapter">
              {currentChapter?.title}
            </span>
          </div>
          <h2 className="course__title">{currentChapter?.title}</h2>

          {/* Instructor Information */}
          <div className="course__header">
            <div className="course__instructor">
              <Avatar className="course__avatar">
                <AvatarImage alt={course.teacherName} />
                <AvatarFallback className="course__avatar-fallback">
                  {course.teacherName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="course__instructor-name">
                {course.teacherName}
              </span>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <Card className="course__video">
          <CardContent className="course__video-container">
            {currentChapter?.video ? (
              <>
                {console.log('Debug - Video URL:', `https://${currentChapter.video}`)}
                <ReactPlayer
                  ref={playerRef}
                  url={`https://${currentChapter.video}`}
                  controls
                  width="100%"
                  height="100%"
                  onProgress={handleProgress}
                  onError={(error) => {
                    console.error('Video Player Error:', error);
                    console.log('Attempted URL:', `https://${currentChapter.video}`);
                  }}
                  onReady={() => console.log('Video Player Ready')}
                  playsinline
                  config={{
                    file: {
                      attributes: {
                        controlsList: "nodownload",
                        crossOrigin: "anonymous",
                      },
                      forceVideo: true,
                      tracks: [],
                    },
                  }}
                />
              </>
            ) : (
              <div className="course__no-video">
                No video available for this chapter.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Notes, Resources, and Quiz */}
        <div className="course__content">
          <Tabs defaultValue="Notes" className="course__tabs">
            {/* Tab List */}
            <TabsList className="course__tabs-list">
              <TabsTrigger className="course__tab" value="Notes">
                Notes
              </TabsTrigger>
              <TabsTrigger className="course__tab" value="Resources">
                Resources
              </TabsTrigger>
              <TabsTrigger className="course__tab" value="Quiz">
                Quiz
              </TabsTrigger>
            </TabsList>

            {/* Notes Content */}
            <TabsContent className="course__tab-content" value="Notes">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Notes Content</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">
                  {currentChapter?.content}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Content */}
            <TabsContent className="course__tab-content" value="Resources">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Resources Content</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">
                  {/* Add resources content here */}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quiz Content */}
            <TabsContent className="course__tab-content" value="Quiz">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Quiz Content</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">
                  {/* Add quiz content here */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Instructor Information */}
          <Card className="course__instructor-card">
            <CardContent className="course__instructor-info">
              <div className="course__instructor-header">
                <Avatar className="course__instructor-avatar">
                  <AvatarImage alt={course.teacherName} />
                  <AvatarFallback className="course__instructor-avatar-fallback">
                    {course.teacherName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="course__instructor-details">
                  <h4 className="course__instructor-name">
                    {course.teacherName}
                  </h4>
                  <p className="course__instructor-title">Senior UX Designer</p>
                </div>
              </div>
              <div className="course__instructor-bio">
                <p>
                  A seasoned Senior UX Designer with over 15 years of experience
                  in creating intuitive and engaging digital experiences.
                  Expertise in leading UX design projects.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Course;
