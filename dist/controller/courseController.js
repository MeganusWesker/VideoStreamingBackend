import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { Course } from "../models/courseModel.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { Stats } from "../models/statsModel.js";
export const createCourse = catchAsyncErrors(async (req, res, next) => {
    const { title, description, category, createdBy, } = req.body;
    console.log(req.body);
    const file = req.file;
    if (!title || !description || !category || !createdBy || !file) {
        return next(new ErrorHandler("please enter all fileds", 400));
    }
    const fileUrl = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content);
    await Course.create({
        title,
        description,
        category,
        createdBy,
        poster: {
            public_id: myCloud.public_id,
            url: myCloud.url,
        },
    });
    res.status(201).json({
        success: true,
        message: "Course has been created",
    });
});
export const getAllCourses = catchAsyncErrors(async (req, res, next) => {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";
    console.log(keyword, category);
    const courses = await Course.find({
        title: {
            $regex: keyword,
            $options: "i",
        },
        category: {
            $regex: category,
            $options: "i",
        },
    }).select("-lectures");
    res.status(201).json({
        success: true,
        courses,
    });
});
export const getCourseLectures = catchAsyncErrors(async (req, res, next) => {
    const course = (await Course.findById(req.params.id));
    if (!course) {
        return next(new ErrorHandler("course not found", 404));
    }
    if (course.views !== undefined)
        course.views += 1;
    await course.save();
    res.status(201).json({
        success: true,
        course,
    });
});
export const addLectures = catchAsyncErrors(async (req, res, next) => {
    const { title, description } = req.body;
    const { id } = req.params;
    const file = req.file;
    if (!title || !description || !file) {
        return next(new ErrorHandler("please enter all fileds", 400));
    }
    const course = (await Course.findById(id));
    if (!course) {
        return next(new ErrorHandler("course not found ", 404));
    }
    const fileUrl = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content, {
        resource_type: "video",
        folder: "videoStreaming",
    });
    course.lectures.push({
        title,
        description,
        video: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });
    course.numOfVideos = course.lectures.length;
    await course.save();
    res.status(201).json({
        success: true,
        message: "lectures added successfully",
    });
});
export const deleteCourse = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const course = (await Course.findById(id));
    if (!course) {
        return next(new ErrorHandler("course not found ", 404));
    }
    await cloudinary.v2.uploader.destroy(course.poster.public_id);
    for (let i = 0; i < course.lectures.length; i++) {
        await cloudinary.v2.uploader.destroy(course.lectures[i].video.public_id, {
            resource_type: "video",
        });
    }
    // await course.remove() ; // deprecated rip bro
    const deletedCourse = await Course.deleteOne({ _id: id });
    if (deletedCourse.deletedCount === 0) {
        return next(new ErrorHandler("course not found ", 404));
    }
    res.status(201).json({
        success: true,
        message: "course deleted successfully",
    });
});
export const deleteLecture = catchAsyncErrors(async (req, res, next) => {
    const { lectureId, courseId } = req.query;
    console.log(lectureId);
    console.log(courseId);
    const course = (await Course.findById(courseId));
    if (!course) {
        return next(new ErrorHandler("course not found ", 404));
    }
    const lecture = course.lectures.find((item) => {
        if (item._id !== undefined && item._id.toString() === lectureId) {
            return item;
        }
    });
    if (lecture === undefined)
        return next(new ErrorHandler("lecture not found", 404));
    await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
        resource_type: "video",
    });
    course.lectures = course.lectures.filter((item) => {
        if (item._id !== undefined && item._id.toString() !== lectureId) {
            return item;
        }
    });
    course.numOfVideos = course.lectures.length;
    await course.save();
    res.status(200).json({
        success: true,
        message: "lecture deleted succefully",
    });
});
Course.watch().on("change", async () => {
    //finding the last state / current month stat
    const stat = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
    // finding users who have subscribed
    const courses = await Course.find({});
    let totatViews = 0;
    for (let index = 0; index < courses.length; index++) {
        const viewsOfcourse = Number(courses[index].views);
        totatViews += viewsOfcourse;
    }
    stat[0].views = totatViews;
    stat[0].createdAt = new Date(Date.now());
    await stat[0].save();
});
