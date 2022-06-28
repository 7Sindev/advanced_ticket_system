import { BugTicketType } from "../models/BugTicketModel";
import { QuestionTicketType } from "../models/QuestionTicketModel";
import { ReportTicketType } from "../models/ReportTicketModel";

export type PostsType = BugTicketType | QuestionTicketType | ReportTicketType;