import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { cn } from "heroui-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInLeft,
	FadeInRight,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Skeleton, SkeletonText, useToast } from "@/components/ui";
import { client, queryClient } from "@/utils/orpc";

type Answer = {
	questionIndex: number;
	selectedAnswer: number;
};

type QuizState = "loading" | "attempting" | "submitted";

export default function DPPAttempt() {
	const { dppId, courseId } = useLocalSearchParams<{
		dppId: string;
		courseId?: string;
	}>();
	const insets = useSafeAreaInsets();
	const { showToast } = useToast();

	const [quizState, setQuizState] = useState<QuizState>("loading");
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Answer[]>([]);
	const [results, setResults] = useState<any>(null);

	// Fetch DPP
	const {
		data: dppData,
		isLoading,
		isSuccess,
	} = useQuery({
		queryKey: ["dpp", dppId],
		queryFn: () => (client as any).v1.student.getDPP({ id: dppId }),
		enabled: !!dppId,
	});

	// Set quiz state to attempting when data is loaded
	useEffect(() => {
		if (isSuccess && dppData) {
			setQuizState("attempting");
		}
	}, [isSuccess, dppData]);

	// Submit mutation
	const submitMutation = useMutation({
		mutationFn: (data: { dppId: string; answers: Answer[] }) =>
			(client as any).v1.student.submitDPPAttempt(data),
		onSuccess: (data: any) => {
			setResults(data);
			setQuizState("submitted");
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			queryClient.invalidateQueries({ queryKey: ["course-dpps", courseId] });
		},
		onError: (error: any) => {
			showToast({
				type: "error",
				title: "Submission failed",
				message: error.message || "Please try again",
			});
		},
	});

	const dpp = dppData?.dpp;
	const questions = dpp?.questions || [];
	const currentQuestion = questions[currentQuestionIndex];

	const handleSelectOption = useCallback(
		(optionIndex: number) => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

			setAnswers((prev) => {
				const existing = prev.find(
					(a) => a.questionIndex === currentQuestionIndex,
				);
				if (existing) {
					return prev.map((a) =>
						a.questionIndex === currentQuestionIndex
							? { ...a, selectedAnswer: optionIndex }
							: a,
					);
				}
				return [
					...prev,
					{ questionIndex: currentQuestionIndex, selectedAnswer: optionIndex },
				];
			});
		},
		[currentQuestionIndex],
	);

	const getSelectedAnswer = (questionIndex: number) => {
		const answer = answers.find((a) => a.questionIndex === questionIndex);
		return answer?.selectedAnswer ?? -1;
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
	};

	const handlePrevQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1);
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
	};

	const handleSubmit = () => {
		const unanswered = questions.length - answers.length;

		if (unanswered > 0) {
			Alert.alert(
				"Unanswered Questions",
				`You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Do you want to submit anyway?`,
				[
					{ text: "Review", style: "cancel" },
					{
						text: "Submit",
						onPress: () => {
							if (dppId) submitMutation.mutate({ dppId, answers });
						},
					},
				],
			);
		} else {
			if (dppId) submitMutation.mutate({ dppId, answers });
		}
	};

	const handleExit = () => {
		if (quizState === "attempting" && answers.length > 0) {
			Alert.alert(
				"Exit Quiz",
				"Your progress will be lost. Are you sure you want to exit?",
				[
					{ text: "Continue Quiz", style: "cancel" },
					{
						text: "Exit",
						style: "destructive",
						onPress: () => router.back(),
					},
				],
			);
		} else {
			router.back();
		}
	};

	// Loading state
	if (isLoading || quizState === "loading") {
		return (
			<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
				<View className="flex-row items-center border-border border-b px-4 py-4">
					<Skeleton className="h-10 w-10 rounded-full" />
					<SkeletonText className="ml-4 flex-1" />
				</View>
				<View className="p-4">
					<Skeleton className="mb-4 h-6 w-1/2" />
					<SkeletonText lines={3} className="mb-6" />
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="mb-3 h-14 w-full rounded-xl" />
					))}
				</View>
			</View>
		);
	}

	// Not found state
	if (!dpp) {
		return (
			<View
				className="flex-1 items-center justify-center bg-background"
				style={{ paddingTop: insets.top }}
			>
				<Ionicons name="help-circle-outline" size={64} color="var(--muted)" />
				<Text className="mt-4 font-medium text-foreground text-lg">
					DPP not found
				</Text>
				<Pressable
					onPress={() => router.back()}
					className="mt-4 rounded-xl bg-primary px-6 py-3"
				>
					<Text className="font-medium text-white">Go Back</Text>
				</Pressable>
			</View>
		);
	}

	// Results state
	if (quizState === "submitted" && results) {
		const { attempt, solutions } = results;
		const percentage = attempt.percentage;
		const isPassing = percentage >= 60;

		return (
			<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
				{/* Header */}
				<View className="flex-row items-center border-border border-b px-4 py-4">
					<Text className="flex-1 font-bold text-foreground text-lg">
						Results
					</Text>
					<Pressable
						onPress={() => router.back()}
						className="h-10 w-10 items-center justify-center rounded-full bg-card"
					>
						<Ionicons name="close" size={20} color="var(--foreground)" />
					</Pressable>
				</View>

				<ScrollView
					className="flex-1"
					contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
				>
					{/* Score Card */}
					<Animated.View
						entering={FadeInDown.duration(400)}
						className={cn(
							"mb-6 items-center rounded-2xl p-6",
							isPassing ? "bg-success/10" : "bg-danger/10",
						)}
					>
						<View
							className={cn(
								"mb-3 h-24 w-24 items-center justify-center rounded-full",
								isPassing ? "bg-success/20" : "bg-danger/20",
							)}
						>
							<Text
								className={cn(
									"font-bold text-3xl",
									isPassing ? "text-success" : "text-danger",
								)}
							>
								{percentage.toFixed(0)}%
							</Text>
						</View>
						<Text
							className={cn(
								"font-bold text-xl",
								isPassing ? "text-success" : "text-danger",
							)}
						>
							{isPassing ? "Great Job!" : "Keep Practicing!"}
						</Text>
						<Text className="mt-1 text-muted-foreground">
							Score: {attempt.score}/{attempt.totalMarks}
						</Text>
					</Animated.View>

					{/* Solutions */}
					<Text className="mb-3 font-semibold text-foreground text-lg">
						Solutions
					</Text>
					{questions.map((q: any, index: number) => {
						const userAnswer = getSelectedAnswer(index);
						const solution = solutions.find(
							(s: any) => s.questionIndex === index,
						);
						const isCorrect = userAnswer === solution?.correctAnswer;

						return (
							<Animated.View
								key={index}
								entering={FadeInDown.delay(100 + index * 50).duration(400)}
								className="mb-4 rounded-xl border border-border bg-card p-4"
							>
								<View className="mb-2 flex-row items-start justify-between">
									<Text className="flex-1 font-medium text-foreground">
										Q{index + 1}. {q.questionText}
									</Text>
									<View
										className={cn(
											"ml-2 h-6 w-6 items-center justify-center rounded-full",
											isCorrect ? "bg-success" : "bg-danger",
										)}
									>
										<Ionicons
											name={isCorrect ? "checkmark" : "close"}
											size={14}
											color="white"
										/>
									</View>
								</View>

								{/* Options */}
								{q.options.map((opt: any, optIndex: number) => (
									<View
										key={optIndex}
										className={cn(
											"mb-2 flex-row items-center rounded-lg p-3",
											optIndex === solution?.correctAnswer
												? "border border-success bg-success/10"
												: optIndex === userAnswer && !isCorrect
													? "border border-danger bg-danger/10"
													: "bg-muted/10",
										)}
									>
										<Text
											className={cn(
												"mr-2 font-bold text-sm",
												optIndex === solution?.correctAnswer
													? "text-success"
													: optIndex === userAnswer && !isCorrect
														? "text-danger"
														: "text-muted-foreground",
											)}
										>
											{String.fromCharCode(65 + optIndex)}.
										</Text>
										<Text
											className={cn(
												"flex-1",
												optIndex === solution?.correctAnswer
													? "text-success"
													: optIndex === userAnswer && !isCorrect
														? "text-danger"
														: "text-foreground",
											)}
										>
											{opt.text}
										</Text>
										{optIndex === userAnswer && (
											<Text className="ml-2 text-muted-foreground text-xs">
												Your answer
											</Text>
										)}
									</View>
								))}

								{/* Explanation */}
								{solution?.explanation && (
									<View className="mt-2 rounded-lg bg-primary/5 p-3">
										<Text className="font-medium text-primary text-xs">
											Explanation:
										</Text>
										<Text className="mt-1 text-foreground text-sm">
											{solution.explanation}
										</Text>
									</View>
								)}
							</Animated.View>
						);
					})}
				</ScrollView>

				{/* Done Button */}
				<View
					className="absolute right-0 bottom-0 left-0 border-border border-t bg-background px-4 py-4"
					style={{ paddingBottom: insets.bottom + 16 }}
				>
					<Button onPress={() => router.back()} className="w-full">
						<Text className="font-semibold text-white">Done</Text>
					</Button>
				</View>
			</View>
		);
	}

	// Quiz state
	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<Animated.View
				entering={FadeIn.duration(400)}
				className="flex-row items-center border-border border-b px-4 py-4"
			>
				<Pressable
					onPress={handleExit}
					className="h-10 w-10 items-center justify-center rounded-full bg-card"
				>
					<Ionicons name="close" size={20} color="var(--foreground)" />
				</Pressable>
				<View className="ml-4 flex-1">
					<Text className="font-bold text-foreground" numberOfLines={1}>
						{dpp.title}
					</Text>
					<Text className="text-muted-foreground text-xs">
						Question {currentQuestionIndex + 1} of {questions.length}
					</Text>
				</View>
				<View className="flex-row items-center rounded-full bg-primary/10 px-3 py-1">
					<Text className="font-medium text-primary text-sm">
						{answers.length}/{questions.length}
					</Text>
				</View>
			</Animated.View>

			{/* Progress Bar */}
			<View className="h-1 bg-muted/20">
				<Animated.View
					className="h-full bg-primary"
					style={{
						width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
					}}
				/>
			</View>

			{/* Question */}
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
			>
				<Animated.View entering={FadeInDown.delay(100).duration(400)}>
					{/* Question Text */}
					<View className="mb-6">
						<Text className="font-bold text-foreground text-lg">
							Q{currentQuestionIndex + 1}. {currentQuestion?.questionText}
						</Text>
						{currentQuestion?.marks && (
							<Text className="mt-1 text-muted-foreground text-sm">
								{currentQuestion.marks} mark
								{currentQuestion.marks > 1 ? "s" : ""}
							</Text>
						)}
					</View>

					{/* Options */}
					{currentQuestion?.options?.map((option: any, index: number) => {
						const isSelected =
							getSelectedAnswer(currentQuestionIndex) === index;
						return (
							<Animated.View
								key={index}
								entering={FadeInLeft.delay(200 + index * 50).duration(300)}
							>
								<Pressable
									onPress={() => handleSelectOption(index)}
									className={cn(
										"mb-3 flex-row items-center rounded-xl border-2 p-4",
										isSelected
											? "border-primary bg-primary/5"
											: "border-border bg-card",
									)}
								>
									<View
										className={cn(
											"mr-3 h-8 w-8 items-center justify-center rounded-full",
											isSelected
												? "bg-primary"
												: "border border-border bg-background",
										)}
									>
										<Text
											className={cn(
												"font-bold text-sm",
												isSelected ? "text-white" : "text-muted-foreground",
											)}
										>
											{String.fromCharCode(65 + index)}
										</Text>
									</View>
									<Text
										className={cn(
											"flex-1",
											isSelected
												? "font-medium text-primary"
												: "text-foreground",
										)}
									>
										{option.text}
									</Text>
									{isSelected && (
										<Ionicons
											name="checkmark-circle"
											size={24}
											color="var(--primary)"
										/>
									)}
								</Pressable>
							</Animated.View>
						);
					})}
				</Animated.View>

				{/* Question Navigation Dots */}
				<Animated.View
					entering={FadeInDown.delay(400).duration(400)}
					className="mt-6"
				>
					<Text className="mb-2 font-medium text-muted-foreground text-sm">
						Jump to question:
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{questions.map((_: any, index: number) => {
							const isAnswered = answers.some((a) => a.questionIndex === index);
							const isCurrent = index === currentQuestionIndex;
							return (
								<Pressable
									key={index}
									onPress={() => {
										setCurrentQuestionIndex(index);
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									}}
									className={cn(
										"h-8 w-8 items-center justify-center rounded-full",
										isCurrent
											? "bg-primary"
											: isAnswered
												? "bg-success"
												: "border border-border bg-card",
									)}
								>
									<Text
										className={cn(
											"font-medium text-xs",
											isCurrent || isAnswered
												? "text-white"
												: "text-foreground",
										)}
									>
										{index + 1}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</Animated.View>
			</ScrollView>

			{/* Bottom Navigation */}
			<View
				className="absolute right-0 bottom-0 left-0 flex-row items-center justify-between border-border border-t bg-background px-4 py-4"
				style={{ paddingBottom: insets.bottom + 16 }}
			>
				<Pressable
					onPress={handlePrevQuestion}
					disabled={currentQuestionIndex === 0}
					className={cn(
						"flex-row items-center rounded-xl px-4 py-3",
						currentQuestionIndex === 0 ? "opacity-50" : "bg-card",
					)}
				>
					<Ionicons name="chevron-back" size={20} color="var(--foreground)" />
					<Text className="ml-1 font-medium text-foreground">Previous</Text>
				</Pressable>

				{currentQuestionIndex === questions.length - 1 ? (
					<Button
						onPress={handleSubmit}
						disabled={submitMutation.isPending}
						className="flex-row items-center"
					>
						{submitMutation.isPending ? (
							<Text className="font-semibold text-white">Submitting...</Text>
						) : (
							<>
								<Text className="font-semibold text-white">Submit</Text>
								<Ionicons
									name="checkmark-circle"
									size={20}
									color="white"
									style={{ marginLeft: 4 }}
								/>
							</>
						)}
					</Button>
				) : (
					<Pressable
						onPress={handleNextQuestion}
						className="flex-row items-center rounded-xl bg-primary px-4 py-3"
					>
						<Text className="mr-1 font-medium text-white">Next</Text>
						<Ionicons name="chevron-forward" size={20} color="white" />
					</Pressable>
				)}
			</View>
		</View>
	);
}
