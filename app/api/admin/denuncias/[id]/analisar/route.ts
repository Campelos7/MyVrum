import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Tentar obter sessão do NextAuth
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("[Analisar Denúncia] Erro ao obter sessão:", sessionError);
    }
    
    // Obter dados do body
    const body = await req.json();
    const { acao, resultado, userEmail } = body;
    
    // Fallback: usar email do body se a sessão não funcionar
    let email: string | null = null;
    if (session?.user?.email) {
      email = session.user.email;
    } else if (userEmail) {
      email = userEmail;
    }
    
    if (!email) {
      console.log("[Analisar Denúncia] Não autenticado: email não encontrado");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log("[Analisar Denúncia] Utilizador não encontrado:", email);
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    if (!admin.admin) {
      console.log("[Analisar Denúncia] Utilizador não é admin:", email);
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    let estado = "aberta";
    if (acao === "em_analise") {
      estado = "em_analise";
    } else if (acao === "encerrar") {
      estado = "encerrada";
    }

    const updated = await prisma.denuncia.update({
      where: { id },
      data: {
        estado,
        resultado: resultado || null,
      },
    });

    await prisma.acaoAdministrativa.create({
      data: {
        tipo: "analise_denuncia",
        adminId: admin.id,
        denunciaId: id,
        descricao: `${acao === "em_analise" ? "Colocou em análise" : "Encerrou"} denúncia ${id}${resultado ? ` - ${resultado}` : ""}`,
        dados: JSON.stringify({ denunciaId: id, acao, resultado }),
      },
    });

    // Buscar a denúncia completa para notificar os intervenientes
    const denunciaCompleta = await prisma.denuncia.findUnique({
      where: { id },
      include: {
        denunciante: { select: { id: true, firstName: true, lastName: true } },
        denunciado: { select: { id: true, firstName: true, lastName: true } },
        anuncio: { select: { id: true, titulo: true, userId: true } },
      },
    });

    // Criar notificações para os intervenientes
    if (denunciaCompleta) {
      const notificacoes = [];

      // Notificar o denunciante
      if (denunciaCompleta.denunciante) {
        let titulo = "";
        let mensagem = "";

        if (estado === "em_analise") {
          titulo = "Denúncia em Análise";
          mensagem = `A tua denúncia sobre ${denunciaCompleta.tipo === "anuncio" ? `o anúncio "${denunciaCompleta.anuncio?.titulo || ""}"` : "um utilizador"} foi colocada em análise pela equipa administrativa.`;
        } else if (estado === "encerrada") {
          titulo = "Denúncia Encerrada";
          const resultadoTexto = resultado === "procedente" ? "foi considerada procedente" : "foi considerada não procedente";
          mensagem = `A tua denúncia sobre ${denunciaCompleta.tipo === "anuncio" ? `o anúncio "${denunciaCompleta.anuncio?.titulo || ""}"` : "um utilizador"} foi encerrada e ${resultadoTexto}.`;
        }

        if (titulo && mensagem) {
          notificacoes.push({
            userId: denunciaCompleta.denunciante.id,
            tipo: "denuncia_atualizada",
            titulo,
            mensagem,
            anuncioId: denunciaCompleta.anuncioId || null,
          });
        }
      }

      // Notificar o denunciado (se existir) OU o dono do anúncio (se a denúncia for sobre um anúncio)
      let userIdParaNotificar: number | null = null;
      
      if (denunciaCompleta.denunciado) {
        // Se há um denunciado (denúncia sobre utilizador), notificar esse utilizador
        userIdParaNotificar = denunciaCompleta.denunciado.id;
      } else if (denunciaCompleta.anuncio && denunciaCompleta.anuncio.userId) {
        // Se a denúncia é sobre um anúncio e não há denunciado, notificar o dono do anúncio (vendedor)
        userIdParaNotificar = denunciaCompleta.anuncio.userId;
      }
      
      if (userIdParaNotificar) {
        let titulo = "";
        let mensagem = "";

        if (estado === "em_analise") {
          titulo = "Denúncia Recebida em Análise";
          if (denunciaCompleta.tipo === "anuncio") {
            mensagem = `Uma denúncia sobre o teu anúncio "${denunciaCompleta.anuncio?.titulo || ""}" está a ser analisada pela equipa administrativa.`;
          } else {
            mensagem = `Uma denúncia sobre ti está a ser analisada pela equipa administrativa.`;
          }
        } else if (estado === "encerrada") {
          titulo = "Denúncia Encerrada";
          const resultadoTexto = resultado === "procedente" ? "foi considerada procedente" : "foi considerada não procedente";
          if (denunciaCompleta.tipo === "anuncio") {
            mensagem = `A denúncia sobre o teu anúncio "${denunciaCompleta.anuncio?.titulo || ""}" foi encerrada e ${resultadoTexto}.`;
          } else {
            mensagem = `A denúncia sobre ti foi encerrada e ${resultadoTexto}.`;
          }
        }

        if (titulo && mensagem) {
          // Verificar se já não existe uma notificação para este utilizador (para evitar duplicados)
          const jaExisteNotificacao = notificacoes.some(n => n.userId === userIdParaNotificar);
          if (!jaExisteNotificacao) {
            notificacoes.push({
              userId: userIdParaNotificar,
              tipo: "denuncia_recebida_atualizada",
              titulo,
              mensagem,
              anuncioId: denunciaCompleta.anuncioId || null,
            });
          }
        }
      }

      // Criar todas as notificações
      for (const notif of notificacoes) {
        try {
          await prisma.notificacao.create({
            data: notif,
          });
        } catch (notifError) {
          console.error("Erro ao criar notificação (não crítico):", notifError);
          // Continua mesmo se uma notificação falhar
        }
      }
    }

    return NextResponse.json({ success: true, denuncia: updated });
  } catch (error) {
    console.error("Erro ao analisar denúncia:", error);
    return NextResponse.json(
      { error: "Erro ao analisar denúncia" },
      { status: 500 }
    );
  }
}

