'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, Edit2, Trash2, User, MoreVertical, X, Check, Star } from 'lucide-react';

interface Feedback {
    id: number;
    event_id: number;
    student_id: number;
    rating: string;
    comment?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
}

interface EventFeedbackProps {
    eventId: number;
    isAdmin: boolean;
    isGroupRep: boolean;
    userId: number;
    accessToken: string | null;
}

export default function EventFeedback({
    eventId,
    isAdmin,
    isGroupRep,
    userId,
    accessToken
}: EventFeedbackProps) {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState<number>(5);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editRating, setEditRating] = useState<number>(5);

    const canSeeAll = isAdmin || isGroupRep;

    // Helper to fetch user details
    const fetchUserDetails = async (studentId: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${studentId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                return data.user;
            }
        } catch (error) {
            console.error(`Failed to fetch user ${studentId}`, error);
        }
        return null;
    };

    const fetchFeedbacks = useCallback(async () => {
        if (!accessToken) return;

        try {
            setIsLoading(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/event-feedback/event/${eventId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Error al cargar comentarios');

            const data: Feedback[] = await response.json();

            // Fetch user details for each feedback in parallel
            const feedbacksWithUsers = await Promise.all(
                data.map(async (fb) => {
                    const user = await fetchUserDetails(fb.student_id);
                    return { ...fb, user };
                })
            );

            // Sort by date descending (newest first)
            const sortedData = feedbacksWithUsers.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setFeedbacks(sortedData);
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar los comentarios');
        } finally {
            setIsLoading(false);
        }
    }, [eventId, accessToken]);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) return;

        setIsSubmitting(true);
        try {
            const body: any = {
                event_id: eventId,
                rating: newRating,
                comment: newComment.trim() || undefined
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/event-feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Error al enviar feedback');

            setNewComment('');
            setNewRating(5);
            fetchFeedbacks();
        } catch (err) {
            console.error(err);
            alert('Error al enviar el feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (feedbackId: number) => {
        if (!accessToken) return;

        try {
            const isMyFeedback = feedbacks.find(f => f.id === feedbackId)?.student_id === userId;
            const endpoint = isAdmin && !isMyFeedback
                ? `/api/event-feedback/admin/${feedbackId}`
                : `/api/event-feedback/${feedbackId}`;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    rating: editRating,
                    comment: editContent.trim() || undefined,
                }),
            });

            if (!response.ok) throw new Error('Error al actualizar feedback');

            setEditingId(null);
            setEditContent('');
            fetchFeedbacks();
        } catch (err) {
            console.error(err);
            alert('Error al actualizar el feedback');
        }
    };

    const handleDelete = async (feedbackId: number) => {
        if (!accessToken || !window.confirm('¿Estás seguro de eliminar este feedback?')) return;

        try {
            const isMyFeedback = feedbacks.find(f => f.id === feedbackId)?.student_id === userId;
            const endpoint = isAdmin && !isMyFeedback
                ? `/api/event-feedback/admin/${feedbackId}`
                : `/api/event-feedback/${feedbackId}`;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) throw new Error('Error al eliminar feedback');

            fetchFeedbacks();
        } catch (err) {
            console.error(err);
            alert('Error al eliminar el feedback');
        }
    };

    const startEdit = (feedback: Feedback) => {
        setEditingId(feedback.id);
        setEditContent(feedback.comment || '');
        setEditRating(Number(feedback.rating));
    };

    // Star Rating Component
    const RenderStars = ({ value, onChange, isEditable }: { value: number, onChange?: (val: number) => void, isEditable?: boolean }) => {
        const handleClick = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
            if (!isEditable || !onChange) return;
            const { left, width } = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - left) / width;
            let newValue = index + (percent > 0.5 ? 1 : 0.5);
            if (newValue < 1) newValue = 1; // Enforce minimum 1 star
            onChange(newValue);
        };

        return (
            <div className="flex">
                {[0, 1, 2, 3, 4].map((index) => {
                    const fill = Math.max(0, Math.min(1, value - index));
                    return (
                        <div
                            key={index}
                            className={`relative inline-block ${isEditable ? 'cursor-pointer' : ''}`}
                            onClick={(e) => handleClick(e, index)}
                            style={{ width: 24, height: 24 }}
                        >
                            <Star size={24} className="text-gray-300 absolute top-0 left-0" />
                            <div style={{ width: `${fill * 100}%`, overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}>
                                <Star size={24} className="text-yellow-400 fill-yellow-400" />
                            </div>
                        </div>
                    );
                })}
                <span className="ml-2 text-sm text-gray-600 font-medium pt-0.5">{value}</span>
            </div>
        );
    };

    // Check if user already submitted feedback
    const hasUserFeedback = feedbacks.some(f => f.student_id === userId);

    // Filter feedbacks to display
    const displayedFeedbacks = canSeeAll ? feedbacks : feedbacks.slice(0, 3);

    if (isLoading) return <div className="text-center py-4 text-gray-500">Cargando comentarios...</div>;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <MoreVertical size={24} />
                </span>
                Comentarios y Feedback
            </h3>

            {/* Feedback Form */}
            {!hasUserFeedback && !canSeeAll && (
                <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Calificación del evento</label>
                        <RenderStars value={newRating} onChange={setNewRating} isEditable={true} />
                    </div>

                    <div className="flex gap-4">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Comparte tu opinión (opcional)..."
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 bg-white"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-fit self-end flex items-center gap-2"
                        >
                            <Send size={18} />
                            Enviar
                        </button>
                    </div>
                </form>
            )}

            {hasUserFeedback && !canSeeAll && (
                <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg mb-8 text-center flex items-center justify-center gap-2">
                    <Check size={20} />
                    Ya has dejado tu feedback para este evento.
                </div>
            )}

            {/* Allow admins/reps to post even if they have one? Usually they reply or edit. 
                But requirement said "Representative: same as student but can view all".
                So they should also be limited to 1 feedback if they act as a user.
                However, usually admins respond. But keeping it simple as per "Misma vista base".
                If isGroupRep or isAdmin, they might want to post 'official' feedback? 
                Let's stick to strict 1 per user ID to satisfy "maximo 1 feedback por persona". 
                Does not invoke role exception.
            */}

            {(canSeeAll && !hasUserFeedback) && (
                <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Calificación del evento</label>
                        <RenderStars value={newRating} onChange={setNewRating} isEditable={true} />
                    </div>

                    <div className="flex gap-4">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Comparte tu opinión (opcional)..."
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 bg-white"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-fit self-end flex items-center gap-2"
                        >
                            <Send size={18} />
                            Enviar
                        </button>
                    </div>
                </form>
            )}

            {/* Feedback List */}
            <div className="space-y-4">
                {displayedFeedbacks.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay comentarios aún. ¡Sé el primero!</p>
                ) : (
                    displayedFeedbacks.map((feedback) => {
                        const isOwner = feedback.student_id === userId;
                        const canEdit = isOwner || isAdmin;
                        const canDelete = isOwner || isAdmin;
                        const userName = feedback.user
                            ? `${feedback.user.first_name} ${feedback.user.last_name}`
                            : 'Usuario desconocido';

                        return (
                            <div key={feedback.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <User size={16} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{userName}</p>
                                            <div className="flex items-center gap-2">
                                                <RenderStars value={Number(feedback.rating)} />
                                                <span className="text-xs text-gray-500 border-l pl-2 border-gray-300">
                                                    {new Date(feedback.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {(canEdit || canDelete) && !editingId && (
                                        <div className="flex gap-2">
                                            {canEdit && (
                                                <button
                                                    onClick={() => startEdit(feedback)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(feedback.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-red-50"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {editingId === feedback.id ? (
                                    <div className="mt-4 p-4 bg-gray-50 rounded border border-blue-100">
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Calificación</label>
                                            <RenderStars value={editRating} onChange={setEditRating} isEditable={true} />
                                        </div>
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 bg-white"
                                            rows={3}
                                            placeholder="Comentario (opcional)"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded text-sm flex items-center gap-1"
                                            >
                                                <X size={14} /> Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleUpdate(feedback.id)}
                                                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                                            >
                                                <Check size={14} /> Guardar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    feedback.comment && (
                                        <p className="text-gray-700 whitespace-pre-wrap mt-2 pl-11">{feedback.comment}</p>
                                    )
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {!canSeeAll && feedbacks.length > 3 && (
                <div className="mt-4 text-center text-sm text-gray-500 italic pb-2">
                    Mostrando los 3 comentarios más recientes.
                </div>
            )}
        </div>
    );
}
